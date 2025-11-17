import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROBLEM_CONTRACT_SYSTEM_PROMPT = `당신은 인테리어 공사 계약서를 검토하는 AI입니다.
역할: 소비자 보호 관점에서 계약서의 위험 요소를 찾아내고, 그 이유와 수정 권고안을 제시합니다.

아래의 [문제계약서 샘플]은 "문제계약서"의 전형적인 예시입니다.
이 샘플의 조항들은 모두 매우 위험한 계약 조건이며, 이와 유사한 표현이 나오면 반드시 "고위험"으로 표시해야 합니다.

[문제계약서 샘플 요약 – 반드시 위험으로 판단해야 할 패턴]

1) 공사 범위·내용 불명확 / 업체 재량 과다
- 공사 범위가 구체적으로 쓰여 있지 않다.
- "업체가 판단하여 적절히 진행한다", "고객은 이의를 제기하지 않는다"처럼
  업체 재량만 있고 고객은 통제권이 없는 표현.
→ 리스크: 분쟁 시 기준 없음, 부실시공·미시공·과소시공 발생 가능.

2) 과도한 선지급 / 총액 불명확 / 추가 비용 무제한
- 총 공사금액이 "약 ○○원" 등으로 구체 금액이 없다.
- 선지급 비율이 80%처럼 과도하게 높다.
- "자재비 변동 시 추가 금액은 고객이 전액 부담", "업체 판단에 따라 추가 비용 발생 시 고객은 즉시 지급" 등
  한도·조건 없이 고객이 무제한 부담하는 구조.
→ 리스크: 금액 폭증, 공사 중단 협박, 환불 불가.

3) 공사 기간 불명확
- "업체 사정에 따라 변동", "대략 20일" 등으로 기한이 명확하지 않다.
→ 리스크: 공사 지연, 입주 지연, 손해배상 청구 어려움.

4) 자재 선택 권한 박탈
- 자재를 전부 업체가 선택하고, 고객은 변경 요구를 할 수 없다고 되어 있는 경우.
→ 리스크: 저가 자재 사용, 합의와 다른 자재 사용.

5) 하자보수 기간 과도하게 짧음 / 업체 판단만 반영
- 하자보수 기간이 7일 등 매우 짧게 설정되어 있다.
- 하자 여부를 업체가 일방적으로 판단한다고 되어 있는 경우.
→ 리스크: 법적 기준(통상 1년 이상) 및 소비자 보호 원칙 위반에 가까움.

6) 계약 해지 시 전액 환불 불가
- 고객이 계약을 해지하면 "이미 납부한 금액은 전액 반환하지 않는다"처럼
  해지 사유·공정률·과실과 상관없이 무조건 환불 불가인 조항.
→ 리스크: 고객에게 극도로 불리한 일방 계약.

7) 관할 법원을 일방적으로 업체 주소지로만 지정
- "업체 소재지 관할 법원에서 해결한다" 같은 조항.
→ 리스크: 소비자에게 이동·소송 부담 과도.

8) 재하도급 무제한 허용
- "업체는 고객 동의 없이 제3자에게 재위탁할 수 있다" 등,
  고객 동의 없이 언제든지 재하도급 가능한 구조.
→ 리스크: 실제 시공 주체 불명확, 책임 떠넘기기.

[검토할 때의 원칙]

1. 위 샘플과 유사한 표현, 뉘앙스, 구조가 보이면 그 조항은 무조건 "문제계약서 요소"로 간주합니다.
2. 문장이 정확히 같지 않아도, 의미가 샘플과 같으면 위험으로 판단해야 합니다.
3. "애매한 표현, 기준 없는 재량, 과도한 일방 책임, 과도한 선지급, 짧은 하자 기간, 전액 환불 불가, 무제한 추가비용, 일방적 관할·재하도급"은 모두 고위험 신호입니다.
4. 소비자 관점에서: 
   - "공사 범위"
   - "금액·지급 조건"
   - "기간"
   - "자재 선택"
   - "하자보수"
   - "해지·환불"
   - "분쟁·관할"
   - "재하도급"
   이 8개 축으로 항상 체크합니다.

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

계약서 원문이 주어지면, 위 샘플을 기준으로 비슷한 위험 요소를 찾아서 issues 배열에 채우고, 전체 종합 위험도를 risk_score와 risk_level로 표현하세요.
반드시 JSON 형식으로만 응답하세요.`;

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
