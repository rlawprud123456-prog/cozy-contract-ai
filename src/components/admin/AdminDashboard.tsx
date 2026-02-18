import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, CalendarDays, Clock, CheckCircle, Crown, ArrowDownCircle, ArrowUpCircle, ShieldCheck, XCircle, Trash2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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

interface EscrowRequest {
  id: string;
  stage_name: string;
  amount: number | null;
  status: string;
  escrow_status: string;
  reject_reason: string | null;
  updated_at: string;
  contract_id: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // 파트너 통계 상태
  const [partnerStats, setPartnerStats] = useState<PartnerStat[]>([]);
  const [platformStats, setPlatformStats] = useState({ todayCases: 0, monthCases: 0, totalFeeEarned: 0 });
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 에스크로 관리 상태
  const [escrowRequests, setEscrowRequests] = useState<EscrowRequest[]>([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedEscrowId, setSelectedEscrowId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
    fetchEscrowRequests();
  }, []);

  // [1] 파트너 실적 데이터 불러오기
  const fetchAdminData = async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: partners } = await supabase.from("partners").select("id, business_name, status, grade");
      const { data: contracts } = await supabase.from("contracts").select("partner_id, total_amount, created_at").gte("created_at", monthStart);

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

        return { id: p.id, name: p.business_name, status: p.status, grade, todayCases: todayContracts.length, monthCases: myContracts.length, totalVolume, feeEarned };
      });

      statsArray.sort((a, b) => b.monthCases - a.monthCases);
      setPartnerStats(statsArray);
      setPlatformStats({ todayCases: globalTodayCases, monthCases: globalMonthCases, totalFeeEarned: globalFeeEarned });
    } catch (error) {
      console.error(error);
    }
  };

  // [2] 에스크로 출금 요청 데이터 불러오기
  const fetchEscrowRequests = async () => {
    try {
      const { data: stages } = await supabase
        .from("contract_stages")
        .select("id, stage_name, amount, status, contract_id, updated_at")
        .order("updated_at", { ascending: false });

      if (stages) {
        // escrow_status, reject_reason은 타입에 아직 반영 안 되어 있으므로 as any 처리
        setEscrowRequests(stages.map((s: any) => ({
          ...s,
          escrow_status: s.escrow_status || "pending",
          reject_reason: s.reject_reason || null,
        })));
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // 파트너 등급 변경
  const togglePartnerGrade = async (partnerId: string, currentGrade: string, partnerName: string) => {
    const newGrade = currentGrade === "prime" ? "normal" : "prime";
    setProcessingId(partnerId);
    try {
      await supabase.from("partners").update({ grade: newGrade } as any).eq("id", partnerId);
      toast({ title: "등급 변경 완료", description: `[${partnerName}] 파트너가 ${newGrade === "prime" ? "프라임" : "일반"} 등급으로 변경되었습니다.` });
      fetchAdminData();
    } catch (error: any) {
      toast({ title: "오류 발생", description: error.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  // 에스크로 승인 처리
  const handleApproveEscrow = async (id: string) => {
    if (!confirm("해당 대금을 파트너에게 최종 지급 승인하시겠습니까?")) return;
    try {
      await supabase.from("contract_stages").update({ escrow_status: "approved" } as any).eq("id", id);
      toast({ title: "에스크로 승인 완료", description: "대금 지급이 승인되었습니다." });
      fetchEscrowRequests();
    } catch (error) {
      console.error(error);
    }
  };

  // 에스크로 거절 모달 열기
  const openRejectModal = (id: string) => {
    setSelectedEscrowId(id);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  // 에스크로 거절 처리 (사유 포함)
  const handleRejectEscrow = async () => {
    if (!rejectReason.trim()) {
      toast({ title: "사유 입력", description: "거절 사유를 반드시 입력해주세요.", variant: "destructive" });
      return;
    }
    try {
      await supabase.from("contract_stages").update({
        escrow_status: "rejected",
        reject_reason: rejectReason,
      } as any).eq("id", selectedEscrowId);

      toast({ title: "거절 처리 완료", description: "시공업체에 반려 사유가 전달됩니다." });
      setIsRejectModalOpen(false);
      fetchEscrowRequests();
    } catch (error) {
      console.error(error);
    }
  };

  // 오래된 내역 삭제 처리
  const handleDeleteEscrow = async (id: string) => {
    if (!confirm("이 기록을 데이터베이스에서 완전히 삭제하시겠습니까? (복구 불가)")) return;
    try {
      await supabase.from("contract_stages").delete().eq("id", id);
      toast({ title: "삭제 완료", description: "오래된 에스크로 내역이 삭제되었습니다." });
      fetchEscrowRequests();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><p className="text-muted-foreground">데이터를 집계 중입니다...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          바로고침 관리자 컨트롤 패널
        </h1>
        <p className="text-muted-foreground mt-1">플랫폼 통계 및 에스크로 대금 지급 승인 관리</p>
      </div>

      <Tabs defaultValue="partners" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="partners">📊 파트너 등급 & 실적 관리</TabsTrigger>
          <TabsTrigger value="escrow">🔒 에스크로 출금 심사</TabsTrigger>
        </TabsList>

        {/* [탭 1] 파트너 실적 관리 */}
        <TabsContent value="partners" className="space-y-4 mt-4">
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

          <Card>
            <div className="px-5 py-4 border-b">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4" /> 파트너 리스트
              </h3>
            </div>
            <div className="divide-y">
              {partnerStats.length === 0 ? (
                <p className="px-5 py-8 text-center text-muted-foreground">데이터가 없습니다.</p>
              ) : (
                partnerStats.map((p) => (
                  <div key={p.id} className="px-5 py-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{p.name}</span>
                      <div className="flex items-center gap-2">
                        {p.grade === "prime" ? (
                          <Badge className="bg-amber-500 text-white text-xs">
                            <Crown className="w-3 h-3 mr-1" /> 프라임
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">일반</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex-1">
                        <p className="text-muted-foreground text-xs">오늘 계약</p>
                        <p className={`font-bold ${p.todayCases > 0 ? 'text-primary' : 'text-foreground'}`}>{p.todayCases}건</p>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div className="flex-1">
                        <p className="text-muted-foreground text-xs">이번 달 누적</p>
                        <p className="font-bold text-foreground">{p.monthCases}건</p>
                      </div>
                    </div>

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
            </div>
          </Card>
        </TabsContent>

        {/* [탭 2] 에스크로 출금 심사 */}
        <TabsContent value="escrow" className="space-y-4 mt-4">
          <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                고객이 승인한 공정 대금입니다. 관리자가 [승인]을 눌러야 실제 업체 계좌로 정산이 진행됩니다. 하자가 의심될 경우 [거절]을 눌러 대금 지급을 보류하세요.
              </p>
            </div>
          </Card>

          <div className="space-y-3">
            {escrowRequests.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                현재 대기 중인 에스크로 출금 요청이 없습니다.
              </Card>
            ) : (
              escrowRequests.map((req) => (
                <Card key={req.id} className="overflow-hidden">
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{req.stage_name}</span>
                      {req.escrow_status === 'approved' && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                          <ShieldCheck className="w-3 h-3 mr-1" /> 지급 승인됨
                        </Badge>
                      )}
                      {req.escrow_status === 'rejected' && (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs">
                          <XCircle className="w-3 h-3 mr-1" /> 지급 거절됨
                        </Badge>
                      )}
                      {req.escrow_status === 'pending' && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" /> 관리자 심사 대기
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-foreground">{(req.amount || 0).toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">원</span>
                    </div>

                    {req.escrow_status === 'rejected' && req.reject_reason && (
                      <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                        반려 사유: {req.reject_reason}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      요청일시: {new Date(req.updated_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="px-4 py-3 bg-muted/30 border-t flex items-center gap-2 justify-end">
                    {req.escrow_status === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => handleApproveEscrow(req.id)} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> 승인
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openRejectModal(req.id)} className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> 거절
                        </Button>
                      </>
                    )}
                    {req.escrow_status !== 'pending' && (
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteEscrow(req.id)} className="text-muted-foreground hover:text-destructive text-xs">
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> 기록 삭제
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* 에스크로 거절(반려) 모달 */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>에스크로 지급 거절</DialogTitle>
            <DialogDescription>
              대금 지급을 보류(거절)하는 명확한 사유를 입력해주세요. 이 사유는 시공업체에게 전달됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="거절 사유를 입력하세요..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>취소</Button>
            <Button onClick={handleRejectEscrow} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold">
              거절 확정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
