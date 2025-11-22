import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 계약서 패턴 예시 (문제 vs 정상)
const CONTRACT_PATTERN_EXAMPLES = `
① 공사 범위
■ 문제계약서 1
공사 범위는 업체가 현장에서 판단하여 적절히 진행한다.

고객은 공사 범위에 이의를 제기할 수 없다.

■ 정상계약서 1
공사 범위는 별첨 '공사내역서'에 따른다.

범위 변경 시 양측 서면 합의 후 추가 비용 산정한다.

───────────────────────────────

② 선지급 비율
■ 문제계약서 2
총 공사금액의 90%를 선지급하며, 환불되지 않는다.

■ 정상계약서 2
계약금 10%, 중간금 40%, 잔금 50% 지급한다.

환불 기준은 상호 합의된 위약 규정을 따른다.

───────────────────────────────

③ 자재 표기
■ 문제계약서 3
사용 자재는 "고급 유사 자재"로 통일 표기한다.

자재 변경은 업체 재량이다.

■ 정상계약서 3
사용 자재는 자재 명세서에 제조사·모델명까지 기재한다.

변경 시 고객 서면 동의가 필요하다.

───────────────────────────────

④ 공사 기간
■ 문제계약서 4
공사 기간은 대략 30일이며, 업체 사정에 따라 무기한 연장될 수 있다.

■ 정상계약서 4
공사 기간은 계약일로부터 30일이며, 연장 필요 시 협의 후 서면 변경한다.

지연 시 책임 및 보상 조건을 명시한다.

───────────────────────────────

⑤ 추가 비용
■ 문제계약서 5
추가 공정 발생 시 업체가 즉시 진행하며, 고객은 비용을 즉시 지급한다.

■ 정상계약서 5
추가 공정은 사전 협의를 통해 견적서를 재작성한다.

고객 승인 후 진행한다.

───────────────────────────────

⑥ 하자보수
■ 문제계약서 6
하자보수 기간은 7일로 한다.

하자 여부는 업체 판단으로 한다.

■ 정상계약서 6
하자보수 기간은 최소 1년으로 한다(도배·전기 등 공정별 상이).

보수 기준은 국토부 표준하자 기준에 따른다.

───────────────────────────────

⑦ 검수 기준
■ 문제계약서 7
공사 완료 여부는 업체가 자체 판단한다.

고객은 별도 검수를 요구할 수 없다.

■ 정상계약서 7
공사 완료 시 고객과 함께 검수 체크리스트로 확인한다.

미비 사항은 보완 후 완료 처리한다.

───────────────────────────────

⑧ 계약 해지
■ 문제계약서 8
고객은 어떠한 사유로도 계약을 해지할 수 없다.

이미 지급된 금액은 환불되지 않는다.

■ 정상계약서 8
양측 합의 또는 귀책사유 발생 시 해지 가능하다.

미완료 공사분은 공정률 기준으로 정산한다.

───────────────────────────────

⑨ 분쟁 관할
■ 문제계약서 9
모든 분쟁은 업체 소재지 관할 법원에서 해결한다.

■ 정상계약서 9
분쟁은 '고객 주소지 또는 공사 장소 관할 법원'을 기본으로 한다.

조정·중재 절차 우선 적용.

───────────────────────────────

⑩ 재하도급
■ 문제계약서 10
업체는 제3자에게 공사를 전부 재하도급할 수 있다.

하도급으로 인해 발생하는 책임은 지지 않는다.

■ 정상계약서 10
재하도급 시 고객 사전 동의를 받는다.

품질·하자·안전 책임은 원도급사가 전부 부담한다.

───────────────────────────────
`;

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

[문제계약서 vs 정상계약서 예시]
${CONTRACT_PATTERN_EXAMPLES}

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
