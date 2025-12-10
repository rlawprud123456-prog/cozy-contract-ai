export interface EstimateData {
  range: string;
  minPricePerPy: number;
  maxPricePerPy: number;
  totalMin?: number;
  totalMax?: number;
  description: string;
  details: { name: string; percent: number; description: string }[];
}

export const ESTIMATE_DB: Record<string, EstimateData> = {
  py24: {
    range: "24평형 (59㎡)",
    minPricePerPy: 160,
    maxPricePerPy: 210,
    description: "좁은 공간을 넓어 보이게 하는 화이트/미니멀 컨셉이 주를 이룹니다.",
    details: [
      { name: "창호(샷시)", percent: 22, description: "복도식/계단식에 따른 단열 창호" },
      { name: "주방/가구", percent: 18, description: "일자형/ㄱ자형 콤팩트 싱크대" },
      { name: "욕실/타일", percent: 15, description: "욕실 1~2개소 전체 철거 후 방수" },
      { name: "목공/단열", percent: 15, description: "몰딩 최소화, 확장부 단열 보강" },
      { name: "도배/바닥", percent: 12, description: "공간감을 주는 광폭 강마루" },
      { name: "철거/설비", percent: 10, description: "기본 철거 및 배관 이설" },
      { name: "조명/기타", percent: 8, description: "매입등 위주의 심플 조명" },
    ],
  },

  py28: {
    range: "28평형 (틈새평수)",
    minPricePerPy: 155,
    maxPricePerPy: 205,
    description: "방 3개 구조가 많으며, 수납 효율을 높이는 설계가 중요합니다.",
    details: [
      { name: "창호(샷시)", percent: 20, description: "전체 내/외부 창호 교체" },
      { name: "가구/수납", percent: 20, description: "부족한 수납을 해결하는 붙박이장" },
      { name: "목공/도어", percent: 16, description: "문틀 교체 및 히든 몰딩" },
      { name: "욕실/타일", percent: 14, description: "욕실 2개소 리모델링" },
      { name: "도배/바닥", percent: 12, description: "실크 벽지 및 강마루" },
      { name: "철거/기초", percent: 10, description: "확장 공사 포함 철거" },
      { name: "전기/조명", percent: 8, description: "식탁 펜던트 및 간접등" },
    ],
  },

  py32: {
    range: "32평형 (국민평수 84㎡)",
    minPricePerPy: 150,
    maxPricePerPy: 200,
    description: "가장 표준적인 3~4Bay 구조로 다양한 디자인 시도가 가능합니다.",
    details: [
      { name: "주방/가구", percent: 22, description: "대면형 아일랜드, 냉장고장 리폼" },
      { name: "창호(샷시)", percent: 18, description: "1군 브랜드(LG/KCC) 창호 적용" },
      { name: "목공/아트", percent: 18, description: "우물천장, 아치게이트, 템바보드" },
      { name: "욕실/타일", percent: 14, description: "600각 포세린 타일, 조적 욕조" },
      { name: "도배/바닥", percent: 12, description: "프리미엄 질감 벽지, 원목마루" },
      { name: "철거/설비", percent: 10, description: "전체 철거 및 시스템 에어컨 배관" },
      { name: "기타/마감", percent: 6, description: "필름 리폼, 탄성코트 등" },
    ],
  },
  
  large: {
    range: "40평대 이상",
    minPricePerPy: 180,
    maxPricePerPy: 250,
    description: "고급 자재 사용 비중이 높고 공사 기간이 4주 이상 소요됩니다.",
    details: [
      { name: "전체공사", percent: 100, description: "대형 평수 맞춤형 프리미엄 공사" }
    ]
  }
};

export function getEstimateData(pyeong: number) {
  if (pyeong < 26) return ESTIMATE_DB.py24;
  if (pyeong < 30) return ESTIMATE_DB.py28;
  if (pyeong < 40) return ESTIMATE_DB.py32;
  return ESTIMATE_DB.large;
}
