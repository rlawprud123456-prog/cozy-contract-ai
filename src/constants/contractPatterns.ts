// src/constants/contractPatterns.ts

export type ClauseCategoryKey =
  | "scope"          // 공사 범위
  | "prepayment"     // 선지급 비율
  | "material"       // 자재 표기
  | "period"         // 공사 기간
  | "extra_cost"     // 추가 비용
  | "defect"         // 하자보수
  | "inspection"     // 검수 기준
  | "termination"    // 계약 해지
  | "jurisdiction"   // 분쟁 관할
  | "subcontract";   // 재하도급

export interface ClausePatternExample {
  id: number;
  category: ClauseCategoryKey;
  title: string;
  problemLabel: string;
  normalLabel: string;
  problemText: string;
  normalText: string;
}

/**
 * 문제계약서 vs 정상계약서 패턴 예시 모음
 * - UI에서 "예시 보기"로 보여줄 수도 있고
 * - 프롬프트에 그대로 녹여서 AI에게 학습 기준으로 줄 수도 있음
 */
export const CONTRACT_PATTERN_EXAMPLES: ClausePatternExample[] = [
  {
    id: 1,
    category: "scope",
    title: "① 공사 범위",
    problemLabel: "■ 문제계약서 1",
    normalLabel: "■ 정상계약서 1",
    problemText: [
      "공사 범위는 업체가 현장에서 판단하여 적절히 진행한다.",
      "",
      "고객은 공사 범위에 이의를 제기할 수 없다.",
    ].join("\n"),
    normalText: [
      "공사 범위는 별첨 '공사내역서'에 따른다.",
      "",
      "범위 변경 시 양측 서면 합의 후 추가 비용 산정한다.",
    ].join("\n"),
  },
  {
    id: 2,
    category: "prepayment",
    title: "② 선지급 비율",
    problemLabel: "■ 문제계약서 2",
    normalLabel: "■ 정상계약서 2",
    problemText: "총 공사금액의 90%를 선지급하며, 환불되지 않는다.",
    normalText: [
      "계약금 10%, 중간금 40%, 잔금 50% 지급한다.",
      "",
      "환불 기준은 상호 합의된 위약 규정을 따른다.",
    ].join("\n"),
  },
  {
    id: 3,
    category: "material",
    title: "③ 자재 표기",
    problemLabel: "■ 문제계약서 3",
    normalLabel: "■ 정상계약서 3",
    problemText: [
      "사용 자재는 \"고급 유사 자재\"로 통일 표기한다.",
      "",
      "자재 변경은 업체 재량이다.",
    ].join("\n"),
    normalText: [
      "사용 자재는 자재 명세서에 제조사·모델명까지 기재한다.",
      "",
      "변경 시 고객 서면 동의가 필요하다.",
    ].join("\n"),
  },
  {
    id: 4,
    category: "period",
    title: "④ 공사 기간",
    problemLabel: "■ 문제계약서 4",
    normalLabel: "■ 정상계약서 4",
    problemText:
      "공사 기간은 대략 30일이며, 업체 사정에 따라 무기한 연장될 수 있다.",
    normalText: [
      "공사 기간은 계약일로부터 30일이며, 연장 필요 시 협의 후 서면 변경한다.",
      "",
      "지연 시 책임 및 보상 조건을 명시한다.",
    ].join("\n"),
  },
  {
    id: 5,
    category: "extra_cost",
    title: "⑤ 추가 비용",
    problemLabel: "■ 문제계약서 5",
    normalLabel: "■ 정상계약서 5",
    problemText:
      "추가 공정 발생 시 업체가 즉시 진행하며, 고객은 비용을 즉시 지급한다.",
    normalText: [
      "추가 공정은 사전 협의를 통해 견적서를 재작성한다.",
      "",
      "고객 승인 후 진행한다.",
    ].join("\n"),
  },
  {
    id: 6,
    category: "defect",
    title: "⑥ 하자보수",
    problemLabel: "■ 문제계약서 6",
    normalLabel: "■ 정상계약서 6",
    problemText: [
      "하자보수 기간은 7일로 한다.",
      "",
      "하자 여부는 업체 판단으로 한다.",
    ].join("\n"),
    normalText: [
      "하자보수 기간은 최소 1년으로 한다(도배·전기 등 공정별 상이).",
      "",
      "보수 기준은 국토부 표준하자 기준에 따른다.",
    ].join("\n"),
  },
  {
    id: 7,
    category: "inspection",
    title: "⑦ 검수 기준",
    problemLabel: "■ 문제계약서 7",
    normalLabel: "■ 정상계약서 7",
    problemText: [
      "공사 완료 여부는 업체가 자체 판단한다.",
      "",
      "고객은 별도 검수를 요구할 수 없다.",
    ].join("\n"),
    normalText: [
      "공사 완료 시 고객과 함께 검수 체크리스트로 확인한다.",
      "",
      "미비 사항은 보완 후 완료 처리한다.",
    ].join("\n"),
  },
  {
    id: 8,
    category: "termination",
    title: "⑧ 계약 해지",
    problemLabel: "■ 문제계약서 8",
    normalLabel: "■ 정상계약서 8",
    problemText: [
      "고객은 어떠한 사유로도 계약을 해지할 수 없다.",
      "",
      "이미 지급된 금액은 환불되지 않는다.",
    ].join("\n"),
    normalText: [
      "양측 합의 또는 귀책사유 발생 시 해지 가능하다.",
      "",
      "미완료 공사분은 공정률 기준으로 정산한다.",
    ].join("\n"),
  },
  {
    id: 9,
    category: "jurisdiction",
    title: "⑨ 분쟁 관할",
    problemLabel: "■ 문제계약서 9",
    normalLabel: "■ 정상계약서 9",
    problemText: "모든 분쟁은 업체 소재지 관할 법원에서 해결한다.",
    normalText: [
      "분쟁은 '고객 주소지 또는 공사 장소 관할 법원'을 기본으로 한다.",
      "",
      "조정·중재 절차 우선 적용.",
    ].join("\n"),
  },
  {
    id: 10,
    category: "subcontract",
    title: "⑩ 재하도급",
    problemLabel: "■ 문제계약서 10",
    normalLabel: "■ 정상계약서 10",
    problemText: [
      "업체는 제3자에게 공사를 전부 재하도급할 수 있다.",
      "",
      "하도급으로 인해 발생하는 책임은 지지 않는다.",
    ].join("\n"),
    normalText: [
      "재하도급 시 고객 사전 동의를 받는다.",
      "",
      "품질·하자·안전 책임은 원도급사가 전부 부담한다.",
    ].join("\n"),
  },
];

/**
 * 프롬프트에 삽입할 예시 텍스트 생성
 */
export const CONTRACT_PATTERN_PROMPT_SNIPPET =
  CONTRACT_PATTERN_EXAMPLES.map((p) => {
    return [
      p.title,
      p.problemLabel,
      p.problemText,
      "",
      p.normalLabel,
      p.normalText,
      "",
      "───────────────────────────────",
    ].join("\n");
  }).join("\n\n");
