import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Calculator, Save, Download, FileText, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/** 카테고리 & 타입 정의 */
type SubCatKey =
  | "bathroom" | "kitchen" | "floor" | "wallpaper" | "window" | "lighting" | "furniture" | "balcony" | "insulation" | "hvac" | "boiler"
  | "cafe" | "restaurant" | "office" | "retail"
  | "fullhome" | "demolition" | "waste" | "design" | "styling";

type TopCatKey = "partial" | "commercial" | "etc" | "full";

const CATEGORY_TREE: Record<TopCatKey, { label: string; children: Record<SubCatKey, string> }> = {
  full: {
    label: "전체 리모델링",
    children: {
      fullhome: "주택/아파트 전체",
      bathroom: "욕실", kitchen: "주방", floor: "바닥", wallpaper: "도배/칠",
      window: "창호", lighting: "조명/전기", furniture: "가구/수납",
      balcony: "발코니/샷시", insulation: "단열/방음", hvac: "시스템에어컨", boiler: "난방/보일러",
      cafe: "카페", restaurant: "식당", office: "사무실", retail: "매장",
      demolition: "철거", waste: "폐기물 처리", design: "설계", styling: "홈스타일링",
    }
  },
  partial: {
    label: "부분 리모델링",
    children: {
      bathroom: "욕실", kitchen: "주방", floor: "바닥(마루/타일)", wallpaper: "도배/도장",
      window: "창호(샷시)", lighting: "조명/전기", furniture: "가구/수납",
      balcony: "발코니/샷시", insulation: "단열/방음", hvac: "시스템에어컨", boiler: "난방/보일러",
      fullhome: "전체", cafe: "카페", restaurant: "식당", office: "사무실", retail: "매장",
      demolition: "철거", waste: "폐기물 처리", design: "설계", styling: "홈스타일링",
    }
  },
  commercial: {
    label: "상업공간",
    children: {
      cafe: "카페", restaurant: "식당", office: "사무실", retail: "매장",
      bathroom: "욕실", kitchen: "주방", floor: "바닥", wallpaper: "도배/칠",
      window: "창호", lighting: "조명/전기", furniture: "가구/수납",
      balcony: "발코니/샷시", insulation: "단열/방음", hvac: "시스템에어컨", boiler: "난방/보일러",
      fullhome: "전체", demolition: "철거", waste: "폐기물 처리", design: "설계", styling: "홈스타일링",
    }
  },
  etc: {
    label: "기타 공종",
    children: {
      demolition: "철거", waste: "폐기물 처리", design: "설계", styling: "홈스타일링",
      bathroom: "욕실", kitchen: "주방", floor: "바닥", wallpaper: "도배/칠",
      window: "창호", lighting: "조명/전기", furniture: "가구/수납",
      balcony: "발코니/샷시", insulation: "단열/방음", hvac: "시스템에어컨", boiler: "난방/보일러",
      fullhome: "전체", cafe: "카페", restaurant: "식당", office: "사무실", retail: "매장",
    }
  }
};

// 평균 단가 가이드
const PRICE_GUIDE: Record<SubCatKey, { avg: number; range: string; note: string }> = {
  bathroom: { avg: 8000000, range: "500-1500만원", note: "타일/도기/방수 포함 기준" },
  kitchen: { avg: 300000, range: "20-50만원/m", note: "상하부장 기준" },
  floor: { avg: 100000, range: "5-20만원/㎡", note: "강화마루 기준" },
  wallpaper: { avg: 25000, range: "1.5-5만원/㎡", note: "실크 벽지 기준" },
  window: { avg: 500000, range: "30-80만원/개", note: "PVC 2중창 기준" },
  lighting: { avg: 150000, range: "5-30만원/개", note: "LED 매입등 기준" },
  furniture: { avg: 2000000, range: "100-500만원/식", note: "붙박이장 기준" },
  balcony: { avg: 800000, range: "50-150만원/m", note: "샷시+마감 기준" },
  insulation: { avg: 50000, range: "3-10만원/㎡", note: "단열재+시공비" },
  hvac: { avg: 3000000, range: "200-500만원/대", note: "시스템에어컨" },
  boiler: { avg: 1500000, range: "80-300만원", note: "콘덴싱 보일러" },
  cafe: { avg: 3000000, range: "200-500만원/평", note: "카페 인테리어" },
  restaurant: { avg: 4000000, range: "300-600만원/평", note: "식당 인테리어" },
  office: { avg: 2000000, range: "100-400만원/평", note: "사무실 인테리어" },
  retail: { avg: 3500000, range: "200-500만원/평", note: "매장 인테리어" },
  fullhome: { avg: 10000000, range: "800-1500만원/평", note: "아파트 전체" },
  demolition: { avg: 100000, range: "5-20만원/㎡", note: "철거+폐기물" },
  waste: { avg: 200000, range: "10-50만원/m³", note: "폐기물 처리" },
  design: { avg: 3000000, range: "100-500만원", note: "설계 패키지" },
  styling: { avg: 500000, range: "30-100만원/회", note: "홈스타일링" },
};

const SUBCAT_META: Record<SubCatKey, { unit: string; hint?: string }> = {
  bathroom: { unit: "실", hint: "욕실 개수 기준" },
  kitchen: { unit: "m", hint: "상/하부장 길이(m) 또는 모듈 수" },
  floor: { unit: "㎡", hint: "시공 면적(㎡), 1평≈3.3㎡" },
  wallpaper: { unit: "㎡", hint: "도배/도장 면적" },
  window: { unit: "개", hint: "창 개수 또는 총 길이(m)" },
  lighting: { unit: "개", hint: "등기구/스위치/전선관 수" },
  furniture: { unit: "식", hint: "제작 가구 수" },
  balcony: { unit: "m", hint: "샷시/난간 길이(m)" },
  insulation: { unit: "㎡", hint: "단열 시공 면적" },
  hvac: { unit: "대", hint: "실내기 대수 기준" },
  boiler: { unit: "대", hint: "보일러 교체/신설" },
  cafe: { unit: "평", hint: "전용면적 기준" },
  restaurant: { unit: "평", hint: "전용면적 기준" },
  office: { unit: "평", hint: "전용면적 기준" },
  retail: { unit: "평", hint: "전용면적 기준" },
  fullhome: { unit: "평", hint: "총 평형(1평≈3.3㎡)" },
  demolition: { unit: "㎡", hint: "철거 면적 또는 항목별 수량" },
  waste: { unit: "m³", hint: "폐기물 용적합" },
  design: { unit: "식", hint: "도면/패키지 단위" },
  styling: { unit: "회", hint: "방문/코디 횟수" },
};

type LineItem = {
  id: string;
  top: TopCatKey | "";
  sub: SubCatKey | "";
  title: string;
  unit: string;
  qty: number;
  unitPrice: number;
  memo?: string;
  amount: number;
};

const money = (n: number) => n.toLocaleString("ko-KR");
const STORAGE_KEY = "estimate_builder_v2";

export default function EstimateBuilder({
  onMakeSummary,
}: {
  onMakeSummary?: (summary: string, total: number) => void;
}) {
  const { toast } = useToast();
  const [items, setItems] = useState<LineItem[]>([]);
  const [feeRate, setFeeRate] = useState<number>(5);
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");

  // 초기 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.items)) setItems(parsed.items);
        if (typeof parsed.feeRate === "number") setFeeRate(parsed.feeRate);
        if (parsed.projectName) setProjectName(parsed.projectName);
        if (parsed.clientName) setClientName(parsed.clientName);
      }
    } catch {}
  }, []);

  // 자동 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, feeRate, projectName, clientName }));
  }, [items, feeRate, projectName, clientName]);

  const subtotal = useMemo(() => items.reduce((s, it) => s + it.amount, 0), [items]);
  const fee = useMemo(() => Math.round(subtotal * (feeRate / 100)), [subtotal, feeRate]);
  const total = subtotal + fee;

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        top: "" as TopCatKey | "",
        sub: "" as SubCatKey | "",
        title: "",
        unit: "",
        qty: 1,
        unitPrice: 0,
        amount: 0,
        memo: "",
      },
    ]);
  };

  const removeRow = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

  const updateRow = (id: string, patch: Partial<LineItem>) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, ...patch };
        const qty = Number(next.qty) || 0;
        const up = Number(next.unitPrice) || 0;
        next.amount = Math.max(0, Math.round(qty * up));
        return next;
      })
    );
  };

  const onChangeTop = (id: string, top: TopCatKey | "") => {
    updateRow(id, { top, sub: "" as any });
  };

  const onChangeSub = (id: string, sub: SubCatKey | "") => {
    let unit = "";
    if (sub && SUBCAT_META[sub]) unit = SUBCAT_META[sub].unit;
    updateRow(id, { sub, unit });
  };

  // 평균 단가 자동 적용
  const applyAvgPrice = (id: string, sub: SubCatKey) => {
    if (!PRICE_GUIDE[sub]) return;
    updateRow(id, { unitPrice: PRICE_GUIDE[sub].avg });
    toast({
      title: "평균 단가 적용",
      description: `${PRICE_GUIDE[sub].range} 범위의 평균가를 적용했습니다`,
    });
  };

  // 견적서 요약
  const makeSummary = () => {
    const lines = items
      .filter((i) => i.title || i.sub)
      .map((i) => {
        const topLabel = i.top ? CATEGORY_TREE[i.top].label : "";
        const subLabel = i.sub ? CATEGORY_TREE[i.top]?.children[i.sub] || "" : "";
        const left = [topLabel, subLabel, i.title].filter(Boolean).join(" / ");
        return `- ${left} : ${i.qty}${i.unit ? i.unit : ""} × ${money(i.unitPrice)}원 = ${money(i.amount)}원`;
      });

    const header = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
인테리어 견적서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

프로젝트: ${projectName || "미정"}
고객명: ${clientName || "미정"}
작성일: ${new Date().toLocaleDateString('ko-KR')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    const body = lines.join("\n");
    const tail = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

소계: ${money(subtotal)}원
플랫폼 수수료(${feeRate}%): ${money(fee)}원

【 총 견적 금액 】 ${money(total)}원

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

※ 본 견적은 개략적인 금액이며, 현장 상황에 따라 변동될 수 있습니다.
※ 자재 등급/브랜드 변경 시 금액이 달라질 수 있습니다.
`;

    const text = header + body + tail;
    if (onMakeSummary) onMakeSummary(text, total);
    navigator.clipboard.writeText(text);
    toast({
      title: "견적서 복사 완료!",
      description: "클립보드에 복사되었습니다",
    });
  };

  const resetAll = () => {
    if (!confirm("모든 항목을 삭제하고 초기화하시겠습니까?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
    setFeeRate(5);
    setProjectName("");
    setClientName("");
    toast({ title: "초기화 완료" });
  };

  return (
    <div className="space-y-4">
      {/* 프로젝트 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            프로젝트 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>프로젝트명</Label>
            <Input
              placeholder="예: 강남구 아파트 32평 전체 리모델링"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>고객명</Label>
            <Input
              placeholder="홍길동"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 메인 견적 빌더 */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            견적 항목
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor="feeRate" className="text-sm">수수료(%)</Label>
            <Input
              id="feeRate"
              value={feeRate}
              onChange={(e) => setFeeRate(Number(e.target.value || 0))}
              type="number"
              min={0}
              max={30}
              step={0.5}
              className="w-20"
            />
            <Button variant="outline" size="sm" onClick={resetAll}>
              <Save className="w-4 h-4 mr-1" /> 초기화
            </Button>
            <Button size="sm" onClick={addRow}>
              <Plus className="w-4 h-4 mr-1" /> 항목 추가
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* 모바일 친화적 카드 형식 */}
          {items.map((row) => {
            const subOptions = row.top
              ? Object.entries(CATEGORY_TREE[row.top].children).filter(([key]) => {
                  if (row.top === "partial") {
                    return ["bathroom","kitchen","floor","wallpaper","window","lighting","furniture","balcony","insulation","hvac","boiler"].includes(key);
                  }
                  if (row.top === "commercial") {
                    return ["cafe","restaurant","office","retail"].includes(key);
                  }
                  if (row.top === "etc") {
                    return ["demolition","waste","design","styling"].includes(key);
                  }
                  if (row.top === "full") {
                    return ["fullhome"].includes(key);
                  }
                  return true;
                })
              : [];

            const hint = row.sub ? SUBCAT_META[row.sub]?.hint : undefined;
            const priceInfo = row.sub ? PRICE_GUIDE[row.sub] : null;

            return (
              <Card key={row.id} className="border-2 border-border">
                <CardContent className="pt-4 space-y-3">
                  {/* 카테고리 선택 */}
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>상위 카테고리</Label>
                      <select
                        className="w-full border border-input bg-background rounded-md h-10 px-3 text-sm"
                        value={row.top}
                        onChange={(e) => onChangeTop(row.id, e.target.value as TopCatKey | "")}
                      >
                        <option value="">선택</option>
                        {Object.entries(CATEGORY_TREE).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>세부 카테고리</Label>
                      <select
                        className="w-full border border-input bg-background rounded-md h-10 px-3 text-sm"
                        value={row.sub}
                        onChange={(e) => onChangeSub(row.id, e.target.value as SubCatKey | "")}
                        disabled={!row.top}
                      >
                        <option value="">선택</option>
                        {subOptions.map(([subKey, label]) => (
                          <option key={subKey} value={subKey}>{label}</option>
                        ))}
                      </select>
                      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
                    </div>
                  </div>

                  {/* 가격 가이드 */}
                  {priceInfo && (
                    <div className="p-3 bg-accent/10 rounded-lg border border-accent/20 flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Lightbulb className="w-4 h-4 text-accent" />
                          <span className="text-sm font-semibold text-foreground">시장 평균 단가</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          범위: {priceInfo.range} | 평균: {money(priceInfo.avg)}원 | {priceInfo.note}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyAvgPrice(row.id, row.sub as SubCatKey)}
                        className="flex-shrink-0"
                      >
                        적용
                      </Button>
                    </div>
                  )}

                  {/* 항목명 */}
                  <div className="space-y-2">
                    <Label>항목명</Label>
                    <Input
                      placeholder="예: 안방 붙박이장 3칸 (슬라이딩 도어)"
                      value={row.title}
                      onChange={(e) => updateRow(row.id, { title: e.target.value })}
                    />
                  </div>

                  {/* 수량/단위/단가 */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>수량</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        value={row.qty}
                        onChange={(e) => updateRow(row.id, { qty: Number(e.target.value || 0) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>단위</Label>
                      <Input
                        placeholder="개"
                        value={row.unit}
                        onChange={(e) => updateRow(row.id, { unit: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>단가(원)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={10000}
                        value={row.unitPrice}
                        onChange={(e) => updateRow(row.id, { unitPrice: Number(e.target.value || 0) })}
                      />
                    </div>
                  </div>

                  {/* 금액 & 삭제 */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <span className="text-sm text-muted-foreground">금액</span>
                      <p className="text-xl font-bold text-accent">{money(row.amount)}원</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => removeRow(row.id)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      삭제
                    </Button>
                  </div>

                  {/* 메모 */}
                  <div className="space-y-2">
                    <Label>메모 (선택)</Label>
                    <Input
                      placeholder="자재 브랜드, 등급, 특이사항 등"
                      value={row.memo || ""}
                      onChange={(e) => updateRow(row.id, { memo: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* 빈 상태 */}
          {items.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
              <Calculator className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">아직 견적 항목이 없습니다</p>
              <Button onClick={addRow} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                첫 항목 추가하기
              </Button>
            </div>
          )}

          {/* 합계 */}
          {items.length > 0 && (
            <div className="mt-6 space-y-3">
              <Card className="bg-muted/50">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>소계</span>
                    <strong>{money(subtotal)}원</strong>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>플랫폼 수수료 ({feeRate}%)</span>
                    <strong className="text-accent">{money(fee)}원</strong>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-accent/10 border-2 border-accent">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">총 견적 금액</p>
                      <p className="text-3xl font-bold text-accent">{money(total)}원</p>
                    </div>
                    <Button size="lg" className="bg-accent hover:bg-accent/90" onClick={makeSummary}>
                      <Download className="w-5 h-5 mr-2" />
                      견적서 복사
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
