import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROBLEM_CONTRACT_SYSTEM_PROMPT = `당신은 인테리어 공사 계약서를 검토하는 AI입니다.
역할: 소비자 보호 관점에서 계약서의 위험 요소를 찾아내고, 그 이유와 수정 권고안을 제시합니다.

[아주 중요한 규칙]

1. 아래에 적힌 "문제계약서 패턴"과 비슷한 의미의 문장이 나오면,
   - 문장 표현이 조금 달라도,
   - 단어 순서가 달라도,
   - 완곡하게 표현돼 있어도,
   그 조항은 반드시 "issues" 배열에 넣고 severity를 "높음" 또는 "매우 높음"으로 지정해야 합니다.

2. 위험 요소가 1개라도 있으면:
   - risk_score는 최소 40 이상
   - risk_level은 최소 "보통" 이상이어야 합니다.
   "위험 요소가 없습니다", "전체적으로 안전합니다"라는 식의 답변은 절대 하지 않습니다.

3. 이 지침을 어기지 마세요. 애매하면 "안전"이 아니라 "위험" 쪽으로 판단합니다.

[문제계약서 패턴 – 이런 내용이 나오면 무조건 문제로 표시할 것]

1) 공사 범위·내용 불명확 / 업체 재량 과다
- 공사 범위가 구체적으로 쓰여 있지 않다.
- 예시:
  - "공사 내용은 업체가 판단하여 적절히 진행한다."
  - "고객은 업체의 시공 방식에 이의를 제기하지 않는다."
→ 기준 없이 업체 재량이 너무 크고, 고객이 통제권이 없으므로 고위험.

2) 과도한 선지급 / 총액 불명확 / 추가 비용 무제한
- 총 공사금액이 "약 ○○원" 등으로 애매하게 쓰여 있다.
- 선지급 비율이 50% 이상, 특히 70~80%처럼 너무 높다.
- "자재비 변동 시 추가 금액은 고객이 전액 부담한다."
- "업체 판단에 따라 추가 비용이 발생할 수 있으며, 고객은 즉시 지급한다."
→ 금액이 무제한으로 늘어날 수 있고, 소비자가 거의 보호받지 못하므로 매우 위험.

3) 공사 기간 불명확
- "업체 사정에 따라 변동될 수 있으며, 대략 ○○일 정도로 한다."
- 시작일/종료일이 명확하게 적혀 있지 않은 경우.
→ 공사 지연, 입주 지연 등 분쟁 시 책임을 묻기 어려우므로 위험.

4) 자재 선택 권한 박탈
- "자재는 업체가 적절한 것으로 선택한다."
- "고객은 자재 변경 요구를 할 수 없다."
→ 저급 자재 사용, 합의와 다른 자재 사용 위험이 크므로 고위험.

5) 하자보수 기간 과도하게 짧음 / 업체가 일방 판단
- "하자보수 기간은 7일로 한다."
- "하자 여부는 업체 판단에 따른다."
→ 통상 1년 이상이 일반적인데 7일 등 매우 짧으면 거의 하자보수 권리가 없으므로 매우 위험.

6) 계약 해지 시 전액 환불 불가
- "고객이 계약을 해지할 경우, 이미 납부한 금액은 반환되지 않는다."
- 해지 사유, 공사 진행 정도와 무관하게 환불 일체 불가.
→ 고객에게 일방적으로 불리한 조항이므로 매우 위험.

7) 관할 법원을 일방적으로 업체 소재지로만 지정
- "업체 소재지 관할 법원에서 해결한다."
→ 소비자에게 이동·소송 부담이 크므로, 소비자에게 불리한 조항으로 위험 요소.

8) 재하도급 무제한 허용
- "업체는 고객 동의 없이 제3자에게 공사를 재위탁할 수 있으며, 고객의 동의를 필요로 하지 않는다."
→ 실제 시공 주체와 책임 소재가 불명확해지고, 문제 발생 시 책임 떠넘기기가 쉬워지므로 위험.

[출력 형식]

다음 JSON 형식으로만 출력하세요:

{
  "risk_score": 0에서 100 사이 숫자 (전체 계약서의 위험도 종합 점수),
  "risk_level": "낮음" | "보통" | "높음" | "매우 높음",
  "issues": [
    {
      "clause_hint": "제3조 공사 금액 및 지급 조건",
      "type": "과도한 선지급 및 일방적 추가비용",
      "severity": "매우 높음",
      "excerpt": "고객은 계약 체결 시 공사대금의 80%를 선지급한다...",
      "reason": "선지급 비율이 과도하게 높고, 추가 비용을 한도 없이 고객에게 전가하고 있습니다.",
      "recommendation": "선지급 비율은 통상 10~30% 내에서 협의하고, 추가 비용은 사전 서면 합의 및 상한선을 명시하도록 수정하는 것이 안전합니다."
    }
  ],
  "summary": "한 문단 정도로 핵심 위험 요약",
  "safe_tips": [
    "공사 범위와 세부 내역을 별도 견적서 또는 특약으로 구체적으로 명시하세요.",
    "하자보수 기간은 최소 1년 이상으로 설정하는 것이 일반적입니다."
  ]
}

계약서 원문이 주어지면, 위 패턴과 유사한 조항을 모두 찾아 issues 배열에 넣고,
전체 종합 위험도를 risk_score와 risk_level로 표현하세요.
절대로 "위험 요소 없음", "전반적으로 안전" 같은 판단을 하지 마세요.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contractText } = await req.json();

    if (!contractText || contractText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "계약서 내용이 너무 짧습니다. 최소 50자 이상 입력해주세요." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing contract with AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: PROBLEM_CONTRACT_SYSTEM_PROMPT },
          { role: "user", content: `다음 계약서를 검토해줘:\n\n${contractText}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "크레딧이 부족합니다. 관리자에게 문의해주세요." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("AI response is empty");
    }

    console.log("AI analysis completed successfully");

    const analysisResult = JSON.parse(aiResponse);

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in contract-review function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "계약서 분석 중 오류가 발생했습니다." 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
