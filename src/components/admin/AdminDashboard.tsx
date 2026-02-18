import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, CalendarDays, Clock, CheckCircle, Crown, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PartnerStat {
  id: string;
  name: string;
  status: string;
  grade: string;
  todayCases: number;
  monthCases: number;
  totalVolume: number;
  feeEarned: number;
}

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
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [partnerStats, setPartnerStats] = useState<PartnerStat[]>([]);
  const [platformStats, setPlatformStats] = useState({ todayCases: 0, monthCases: 0, totalFeeEarned: 0 });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: partners } = await supabase.from("partners").select("id, business_name, status, grade");

      const { data: contracts } = await supabase
        .from("contracts")
        .select("partner_id, total_amount, created_at")
        .gte("created_at", monthStart);

      if (!partners || !contracts) return;

      let globalTodayCases = 0;
      let globalMonthCases = contracts.length;
      let globalFeeEarned = 0;

      const statsArray: PartnerStat[] = partners.map(p => {
        const grade = (p as any).grade || "normal";
        const feeRate = grade === "prime" ? 3.3 : 5.5;

        const myContracts = contracts.filter(c => c.partner_id === p.id);
        const todayContracts = myContracts.filter(c => c.created_at >= todayStart);

        const totalVolume = myContracts.reduce((sum, c) => sum + (c.total_amount || 0), 0);
        const feeEarned = Math.floor(totalVolume * (feeRate / 100));

        globalTodayCases += todayContracts.length;
        globalFeeEarned += feeEarned;

        return {
          id: p.id,
          name: p.business_name,
          status: p.status,
          grade,
          todayCases: todayContracts.length,
          monthCases: myContracts.length,
          totalVolume,
          feeEarned,
        };
      });

      statsArray.sort((a, b) => b.monthCases - a.monthCases);

      setPartnerStats(statsArray);
      setPlatformStats({ todayCases: globalTodayCases, monthCases: globalMonthCases, totalFeeEarned: globalFeeEarned });
    } catch (error) {
      console.error("관리자 데이터 로딩 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePartnerGrade = async (partnerId: string, currentGrade: string, partnerName: string) => {
    const newGrade = currentGrade === "prime" ? "normal" : "prime";
    setProcessingId(partnerId);

    try {
      const { error } = await supabase
        .from("partners")
        .update({ grade: newGrade } as any)
        .eq("id", partnerId);

      if (error) throw error;

      toast({
        title: newGrade === "prime" ? "프라임 임명 완료" : "프라임 해지 완료",
        description: `[${partnerName}] 업체가 ${newGrade === "prime" ? "프라임(수수료 3.3%)" : "일반(수수료 5.5%)"} 파트너로 변경되었습니다.`,
      });

      fetchAdminData();
    } catch (error: any) {
      toast({ title: "오류 발생", description: error.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          바로고침 관리자 대시보드
        </h1>
        <p className="text-muted-foreground mt-1">실시간 파트너 성과 및 정산 현황 (등급별 수수료 자동 적용)</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            오늘 성사된 계약
          </div>
          <p className="text-2xl font-bold text-foreground">{platformStats.todayCases}건</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Clock className="w-4 h-4 text-primary" />
            이번 달 총 계약
          </div>
          <p className="text-2xl font-bold text-foreground">{platformStats.monthCases}건</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            이번 달 예상 수수료 수익
          </div>
          <p className="text-2xl font-bold text-foreground">{platformStats.totalFeeEarned.toLocaleString()}원</p>
        </Card>
      </div>

      {/* 파트너별 상세 리스트 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" /> 파트너별 실적 보드 및 등급 관리
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          {loading ? (
            <p className="px-5 py-8 text-center text-muted-foreground">데이터를 집계 중입니다...</p>
          ) : partnerStats.length === 0 ? (
            <p className="px-5 py-8 text-center text-muted-foreground">등록된 파트너 실적이 없습니다.</p>
          ) : (
            partnerStats.map((p) => (
              <div key={p.id} className="px-5 py-4 border-t flex flex-col gap-3">
                {/* 파트너 정보 */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{p.name}</span>
                  <div className="flex items-center gap-2">
                    {p.grade === "prime" ? (
                      <Badge className="bg-amber-500 text-white text-xs">
                        <Crown className="w-3 h-3 mr-1" /> 프라임
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        일반 (Normal)
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 계약 건수 */}
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

                {/* 수익 및 등급 관리 */}
                <div className="bg-muted/50 rounded-md p-2.5 text-sm flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs">플랫폼 수수료 ({p.grade === 'prime' ? '3.3%' : '5.5%'})</p>
                    <p className="font-bold text-foreground">{p.feeEarned.toLocaleString()}원</p>
                  </div>

                  <Button
                    variant={p.grade === "prime" ? "outline" : "default"}
                    size="sm"
                    onClick={() => togglePartnerGrade(p.id, p.grade, p.name)}
                    disabled={processingId === p.id}
                    className={`h-8 px-3 text-xs font-bold transition-all ${
                      p.grade === "prime"
                        ? "text-destructive border-destructive/30 hover:bg-destructive/10"
                        : "bg-amber-500 hover:bg-amber-600 text-white"
                    }`}
                  >
                    {processingId === p.id ? "처리중..." : p.grade === "prime" ? (
                      <><ArrowDownCircle className="w-3.5 h-3.5 mr-1" /> 프라임 해지</>
                    ) : (
                      <><ArrowUpCircle className="w-3.5 h-3.5 mr-1" /> 프라임 임명</>
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
