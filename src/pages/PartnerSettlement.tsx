import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Info, ArrowRight, TrendingUp, Receipt, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PartnerSettlement() {
  const [loading, setLoading] = useState(true);
  const [partnerGrade, setPartnerGrade] = useState("normal");
  const [settlement, setSettlement] = useState({
    totalSales: 0,
    feeRate: 5.5,
    feeAmount: 0,
    vatAmount: 0,
    actualCash: 0,
    thisMonthCases: 0,
  });

  useEffect(() => {
    fetchSettlementData();
  }, []);

  const fetchSettlementData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: partnerData } = await supabase
        .from("partners")
        .select("id, grade")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!partnerData) return;

      const grade = (partnerData as any).grade || "normal";
      setPartnerGrade(grade);

      const feeRate = grade === "prime" ? 3.3 : 5.5;

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: contracts } = await supabase
        .from("contracts")
        .select("total_amount")
        .eq("partner_id", partnerData.id)
        .gte("created_at", firstDayOfMonth);

      if (contracts) {
        const totalSales = contracts.reduce((sum, c) => sum + (c.total_amount || 0), 0);
        const feeAmount = Math.floor(totalSales * (feeRate / 100));
        const vatAmount = Math.floor(feeAmount * 0.1);
        const actualCash = totalSales - (feeAmount + vatAmount);

        setSettlement({
          totalSales,
          feeRate,
          feeAmount,
          vatAmount,
          actualCash,
          thisMonthCases: contracts.length,
        });
      }
    } catch (error) {
      console.error("정산 데이터 로딩 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">정산 데이터를 불러오는 중입니다...</p></div>;

  const isPrime = partnerGrade === "prime";

  return (
    <div className="max-w-md mx-auto p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">이번 달 정산 현황</h1>
        {isPrime ? (
          <Badge className="bg-amber-500 text-white">
            <Crown className="w-3 h-3 mr-1" /> 프라임 파트너
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            일반 파트너
          </Badge>
        )}
      </div>

      <Card className="relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full" />

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="w-4 h-4" />
            실수령 예정액 (현금)
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-primary">
              {settlement.actualCash.toLocaleString()}
            </span>
            <span className="text-base text-muted-foreground">원</span>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span className="flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5" /> 고객 총 결제금액
              </span>
              {settlement.totalSales.toLocaleString()}원
            </div>
            <div className="flex justify-between text-destructive/80">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> 플랫폼 수수료 ({settlement.feeRate}%)
              </span>
              -{settlement.feeAmount.toLocaleString()}원
            </div>
            <div className="flex justify-between text-destructive/60">
              <span className="flex items-center gap-1">
                ↳ 부가세 (10%)
              </span>
              -{settlement.vatAmount.toLocaleString()}원
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 bg-muted/50 border-t">
          <Button variant="ghost" size="sm">
            정산 계좌 확인
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">이번 달 완료 공사</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{settlement.thisMonthCases}</span>
            <span className="text-sm text-muted-foreground">건</span>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 평균 객단가
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {settlement.thisMonthCases > 0
                ? Math.floor(settlement.totalSales / settlement.thisMonthCases / 10000).toLocaleString()
                : 0}
            </span>
            <span className="text-sm text-muted-foreground">만원</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
