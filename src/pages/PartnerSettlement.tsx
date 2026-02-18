import { Wallet, Info, ArrowRight, TrendingUp, Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PartnerSettlement() {
  const settlementData = {
    totalSales: 25000000,
    feeRate: 10,
    feeAmount: 2500000,
    actualCash: 22500000,
    thisMonthCases: 3,
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">이번 달 정산 현황</h1>
        <Badge variant="outline" className="text-muted-foreground">
          2026년 2월
        </Badge>
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
              {settlementData.actualCash.toLocaleString()}
            </span>
            <span className="text-base text-muted-foreground">원</span>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span className="flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5" /> 고객 총 결제금액
              </span>
              {settlementData.totalSales.toLocaleString()}원
            </div>
            <div className="flex justify-between text-destructive/80">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> 플랫폼 수수료 ({settlementData.feeRate}%)
              </span>
              -{settlementData.feeAmount.toLocaleString()}원
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
            <span className="text-2xl font-bold text-foreground">{settlementData.thisMonthCases}</span>
            <span className="text-sm text-muted-foreground">건</span>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 평균 객단가
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {Math.floor(settlementData.totalSales / settlementData.thisMonthCases / 10000)}
            </span>
            <span className="text-sm text-muted-foreground">만원</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
