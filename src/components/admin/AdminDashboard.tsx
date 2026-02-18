import { Users, CalendarDays, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminDashboardProps {
  stats: {
    users: number;
    partners: number;
    contracts: number;
    estimates: number;
    pendingPayments: number;
    damageReports: number;
  };
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const partners = [
    { id: 1, name: "공간작업소", todayCases: 2, monthCases: 12, totalVolume: 85000000, feeEarned: 8500000 },
    { id: 2, name: "모던인테리어", todayCases: 0, monthCases: 5, totalVolume: 32000000, feeEarned: 3200000 },
    { id: 3, name: "바른디자인", todayCases: 1, monthCases: 8, totalVolume: 45000000, feeEarned: 4500000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          바로고침 관리자 대시보드
        </h1>
        <p className="text-muted-foreground mt-1">실시간 파트너 성과 및 정산 현황</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            오늘 성사된 계약
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.contracts > 0 ? stats.contracts : 3}건</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Clock className="w-4 h-4 text-primary" />
            이번 달 총 계약
          </div>
          <p className="text-2xl font-bold text-foreground">25건</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            이번 달 플랫폼 예상 수익
          </div>
          <p className="text-2xl font-bold text-foreground">16,200,000원</p>
        </Card>
      </div>

      {/* 파트너별 상세 리스트 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" /> 파트너별 실적 보드
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          {partners.map((p) => (
            <div key={p.id} className="px-5 py-4 border-t flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{p.name}</span>
                <Badge variant="secondary" className="text-xs">
                  정상 활동중
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs">오늘 계약</p>
                  <p className={`font-bold ${p.todayCases > 0 ? 'text-primary' : 'text-foreground'}`}>
                    {p.todayCases}건
                  </p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs">이번 달 누적</p>
                  <p className="font-bold text-foreground">{p.monthCases}건</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-md p-2.5 text-sm">
                <p className="text-muted-foreground text-xs">발생 수수료 (매출)</p>
                <p className="font-bold text-foreground">{p.feeEarned.toLocaleString()}원</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  총 거래액: {p.totalVolume.toLocaleString()}원
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
