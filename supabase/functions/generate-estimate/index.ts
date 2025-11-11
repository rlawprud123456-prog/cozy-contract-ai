import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { estimateRequestId } = await req.json();
    
    if (!estimateRequestId) {
      throw new Error("estimateRequestId is required");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 견적 신청 데이터 조회
    const { data: estimateRequest, error: estimateError } = await supabase
      .from('estimate_requests')
      .select('*')
      .eq('id', estimateRequestId)
      .single();

    if (estimateError) {
      console.error('Error fetching estimate request:', estimateError);
      throw new Error("견적 신청을 찾을 수 없습니다.");
    }

    // 승인된 파트너 목록 조회 (같은 카테고리)
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('id, business_name, category, description')
      .eq('status', 'approved')
      .eq('category', estimateRequest.category);

    if (partnersError) {
      console.error('Error fetching partners:', partnersError);
    }

    // AI에게 견적서 생성 요청
    const prompt = `다음 인테리어 견적 신청을 분석하여 상세한 견적서를 생성해주세요:

프로젝트명: ${estimateRequest.project_name}
카테고리: ${estimateRequest.category}
위치: ${estimateRequest.location}
평수: ${estimateRequest.area}평
예상 예산: ${estimateRequest.estimated_budget ? estimateRequest.estimated_budget.toLocaleString() + '원' : '미정'}
설명: ${estimateRequest.description || '없음'}

다음 형식으로 견적서를 생성해주세요:
1. 총 예상 금액 (원 단위)
2. 항목별 비용 (최소 7개 항목, 각 항목은 이름, 금액, 카테고리(자재비/인건비/설계비/기타) 포함)
   - 자재비: 바닥재, 벽지, 조명, 가구 등
   - 인건비: 철거, 목공, 전기, 도배 등
   - 설계비: 설계 및 감리
   - 기타: 폐기물 처리, 운반비 등
3. 예상 작업 기간 (일 단위)
4. 작업 일정 단계별 설명 (최소 3단계)
5. 추천 사항 및 주의사항

평수와 카테고리를 고려하여 현실적인 금액을 산정해주세요. 자재비와 인건비를 명확히 구분해주세요.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: '당신은 전문 인테리어 견적 전문가입니다. 평수, 카테고리, 위치를 기반으로 정확하고 상세한 견적서를 작성합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_estimate',
              description: '인테리어 견적서를 구조화된 형식으로 생성합니다',
              parameters: {
                type: 'object',
                properties: {
                  total_amount: {
                    type: 'number',
                    description: '총 예상 금액 (원)'
                  },
                  items: {
                    type: 'array',
                    description: '항목별 비용 목록',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: '항목명' },
                        amount: { type: 'number', description: '금액 (원)' },
                        category: { type: 'string', description: '비용 구분', enum: ['자재비', '인건비', '설계비', '기타'] },
                        description: { type: 'string', description: '항목 설명' }
                      },
                      required: ['name', 'amount', 'category']
                    }
                  },
                  duration_days: {
                    type: 'number',
                    description: '예상 작업 기간 (일)'
                  },
                  schedule: {
                    type: 'array',
                    description: '작업 일정',
                    items: {
                      type: 'object',
                      properties: {
                        stage: { type: 'string', description: '단계명' },
                        duration: { type: 'string', description: '소요 기간' },
                        tasks: { type: 'string', description: '작업 내용' }
                      },
                      required: ['stage', 'duration', 'tasks']
                    }
                  },
                  recommendations: {
                    type: 'string',
                    description: '추천 사항 및 주의사항'
                  }
                },
                required: ['total_amount', 'items', 'duration_days', 'schedule', 'recommendations']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_estimate' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API 오류: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData, null, 2));

    // tool call 결과 파싱
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('AI가 견적서를 생성하지 못했습니다.');
    }

    const estimateData = JSON.parse(toolCall.function.arguments);

    // 파트너 추천 로직 (간단한 랜덤 선택)
    let recommendedPartner = null;
    if (partners && partners.length > 0) {
      recommendedPartner = partners[Math.floor(Math.random() * partners.length)];
    }

    return new Response(
      JSON.stringify({
        success: true,
        estimate: estimateData,
        recommendedPartner,
        estimateRequest: {
          id: estimateRequest.id,
          project_name: estimateRequest.project_name,
          category: estimateRequest.category,
          location: estimateRequest.location,
          area: estimateRequest.area,
          client_name: estimateRequest.client_name,
          phone: estimateRequest.phone
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-estimate function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
