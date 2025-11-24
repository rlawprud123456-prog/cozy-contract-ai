import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Users, Wallet, Bell, ArrowRight, CheckCircle2, Clock, Ban, RefreshCw } from "lucide-react";

interface PartnerCenterProps {
  user: any;
}

interface Contract {
  id: string;
  project_name: string;
  partner_name: string;
  partner_phone?: string;
  total_amount: number;
  deposit_amount: number;
  mid_amount: number;
  final_amount: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  created_at: string;
}

interface Payment {
  id: string;
  contract_id: string;
  amount: number;
  type: "deposit" | "mid" | "final";
  status: "held" | "pending_approval" | "released" | "refunded";
  created_at: string;
  released_at?: string;
  refunded_at?: string;
}

type TabKey = "clients" | "settlement" | "tasks";

export default function PartnerCenter({ user }: PartnerCenterProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("clients");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Record<string, Payment[]>>({});
  const [loading, setLoading] = useState(false);

  // 데이터 로드 함수를 useCallback으로 메모이제이션
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: contractsData, error: contractsError } = await supabase
        .from("contracts")
        .select("*")
        .order("created_at", { ascending: false });

      if (contractsError) throw contractsError;
      
      const list = (contractsData || []) as Contract[];
      setContracts(list);

      const map: Record<string, Payment[]> = {};
      // Promise.all로 병렬 처리하여 성능 개선
      await Promise.all(
        list.map(async (c) => {
          try {
            const { data: paymentsData, error: paymentsError } = await supabase
              .from("escrow_payments")
              .select("*")
              .eq("contract_id", c.id)
              .order("created_at", { ascending: true });

            if (paymentsError) throw paymentsError;
            map[c.id] = (paymentsData || []) as Payment[];
          } catch (e) {
            console.error(`계약 ${c.id} 결제 정보 로드 실패:`, e);
            map[c.id] = [];
          }
        })
      );
      setPayments(map);
    } catch (e) {
      console.error("데이터 로드 실패:", e);
      toast({
        title: "데이터 로드 실패",
        description: "파트너 정보를 불러오지 못했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 파트너 이름 기준으로 필터 (MVP: 이름으로 매칭)
  const myContracts = useMemo(() => {
    if (!user?.user_metadata?.name) return [];
    return contracts.filter((c) => c.partner_name === user.user_metadata.name);
  }, [contracts, user?.user_metadata?.name]);

  // 요약 지표
  const stats = useMemo(() => {
    const totalProjects = myContracts.length;
    const activeProjects = myContracts.filter(
      (c) => c.status === "pending" || c.status === "in_progress"
    ).length;
    const completedProjects = myContracts.filter((c) => c.status === "completed").length;

    let expectedRevenue = 0;
    let releasedRevenue = 0;
    
    myContracts.forEach((c) => {
      expectedRevenue += c.total_amount || 0;
      const ps = payments[c.id] || [];
      releasedRevenue += ps
        .filter((p) => p.status === "released")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
    });

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      expectedRevenue,
      releasedRevenue,
    };
  }, [myContracts, payments]);

  // 정산 관련 데이터
  const settlementItems = useMemo(() => {
    return myContracts.map((c) => {
      const ps = payments[c.id] || [];
      const totalPaid = ps
        .filter((p) => p.status === "released")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const held = ps
        .filter((p) => p.status === "held")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const refunded = ps
        .filter((p) => p.status === "refunded")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const isAllPaid = c.total_amount > 0 && totalPaid >= c.total_amount;

      return {
        contract: c,
        totalPaid,
        held,
        refunded,
        isAllPaid,
      };
    });
  }, [myContracts, payments]);

  // 할 일: 진행중/대기중 공사들
  const taskItems = useMemo(() => {
    return myContracts.filter((c) => c.status === "pending" || c.status === "in_progress");
  }, [myContracts]);

  const formatMoney = (n: number) => {
    if (typeof n !== 'number' || isNaN(n)) return '0';
    return n.toLocaleString("ko-KR");
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("ko-KR", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: Contract['status']) => {
    const badgeConfig = {
      pending: {
        className: "bg-yellow-500 hover:bg-yellow-600",
        icon: Clock,
        label: "대기"
      },
      in_progress: {
        className: "bg-blue-500 hover:bg-blue-600",
        icon: ArrowRight,
        label: "진행중"
      },
      completed: {
        className: "bg-green-500 hover:bg-green-600",
        icon: CheckCircle2,
        label: "완료"
      },
      cancelled: {
        className: "bg-red-500 hover:bg-red-600",
        icon: Ban,
        label: "취소"
      }
    };

    const config = badgeConfig[status];
    if (!config) return <Badge variant="outline">{status}</Badge>;

    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // 정산 요청 (MVP: 더미, 토스트만)
  const handlePayoutRequest = useCallback((contractId: string) => {
    const contract = myContracts.find((c) => c.id === contractId);
    toast({
      title: "정산 요청 접수",
      description: contract
        ? `${contract.project_name} 건에 대한 정산 요청이 접수되었습니다. (데모 기능)`
        : "정산 요청이 접수되었습니다. (데모 기능)",
    });
  }, [myContracts, toast]);

  // 전체 정산 요청
  const handleBulkPayoutRequest = useCallback(() => {
    const pendingAmount = settlementItems
      .filter(item => item.held > 0)
      .reduce((sum, item) => sum + item.held, 0);
    
    toast({
      title: "정산 통합 요청",
      description: `총 ${formatMoney(pendingAmount)}원에 대한 일괄 정산 요청이 접수되었습니다. (데모 기능)`,
    });
  }, [settlementItems, toast]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-4">
        <div className="container mx-auto max-w-6xl py-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-accent" />
            <span className="ml-3 text-muted-foreground">데이터 불러오는 중…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="container mx-auto max-w-6xl py-6 space-y-6">
        {/* 상단 인사 / 요약 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">인테리어 파트너 센터</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {user?.user_metadata?.name ? `${user.user_metadata.name} 파트너님` : "파트너님"}의 작업 현황
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              고객 공사 진행 상황을 확인하고, 정산·고객 관리를 한 곳에서 관리하세요.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              variant={activeTab === "clients" ? "default" : "outline"} 
              onClick={() => setActiveTab("clients")}
              className="transition-all"
            >
              <Users className="w-4 h-4 mr-1" />
              고객 관리
            </Button>
            <Button
              variant={activeTab === "settlement" ? "default" : "outline"}
              onClick={() => setActiveTab("settlement")}
              className="transition-all"
            >
              <Wallet className="w-4 h-4 mr-1" />
              정산 관리
            </Button>
            <Button 
              variant={activeTab === "tasks" ? "default" : "outline"} 
              onClick={() => setActiveTab("tasks")}
              className="transition-all"
            >
              <Bell className="w-4 h-4 mr-1" />
              할 일
            </Button>
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">전체 프로젝트</CardTitle>
            </CardHeader>
            <CardContent className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">{stats.totalProjects}</span>
              <span className="text-xs text-muted-foreground">
                진행중 {stats.activeProjects} · 완료 {stats.completedProjects}
              </span>
            </CardContent>
          </Card>
          <Card className="shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">예상 매출(총 계약금액)</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{formatMoney(stats.expectedRevenue)}원</span>
            </CardContent>
          </Card>
          <Card className="shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">지급 완료 정산액</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{formatMoney(stats.releasedRevenue)}원</span>
            </CardContent>
          </Card>
        </div>

        {/* 탭별 내용 */}
        {activeTab === "clients" && (
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>고객 / 프로젝트 관리</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myContracts.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground text-sm">
                    담당 중인 프로젝트가 없습니다.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    계약 생성 시 파트너 이름을 정확히 입력하면 자동으로 연결됩니다.
                  </p>
                </div>
              ) : (
                myContracts.map((c) => {
                  const ps = payments[c.id] || [];
                  const totalPaid = ps
                    .filter((p) => p.status === "released")
                    .reduce((sum, p) => sum + (p.amount || 0), 0);
                  return (
                    <div
                      key={c.id}
                      className="border rounded-xl p-3 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-secondary/20 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{c.project_name}</span>
                          {getStatusBadge(c.status)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          계약일 {formatDate(c.created_at)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          총액 {formatMoney(c.total_amount)}원 · 지급 완료 {formatMoney(totalPaid)}원
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() =>
                            toast({
                              title: "준비 중",
                              description: "상세 프로젝트 페이지는 추후 연동 예정입니다. (MVP 더미)",
                            })
                          }
                        >
                          상세보기
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "settlement" && (
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <CardTitle>정산 관리</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkPayoutRequest}
                disabled={settlementItems.filter(item => item.held > 0).length === 0}
              >
                전체 정산 요청하기
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {settlementItems.length === 0 ? (
                <div className="py-12 text-center">
                  <Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground text-sm">
                    정산 대상 프로젝트가 없습니다.
                  </p>
                </div>
              ) : (
                settlementItems.map((item) => (
                  <div
                    key={item.contract.id}
                    className="border rounded-xl p-3 md:p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between hover:bg-secondary/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.contract.project_name}</span>
                        {getStatusBadge(item.contract.status)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        총 계약금액 {formatMoney(item.contract.total_amount)}원
                      </div>
                      <div className="text-xs text-muted-foreground">
                        지급 완료 {formatMoney(item.totalPaid)}원 · 에스크로 보관{" "}
                        {formatMoney(item.held)}원 · 환불 {formatMoney(item.refunded)}원
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      {item.isAllPaid ? (
                        <Badge className="bg-green-500">정산 완료</Badge>
                      ) : item.held > 0 ? (
                        <Badge className="bg-blue-500">정산 가능 금액 보관중</Badge>
                      ) : (
                        <Badge variant="outline">정산 대기</Badge>
                      )}
                      {item.held > 0 && (
                        <Button
                          size="sm"
                          className="bg-accent hover:bg-accent/90"
                          onClick={() => handlePayoutRequest(item.contract.id)}
                        >
                          이 건 정산 요청
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "tasks" && (
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>오늘 살펴볼 공사 / 할 일</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {taskItems.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground text-sm">
                    현재 진행중 또는 대기중인 공사가 없습니다.
                  </p>
                </div>
              ) : (
                taskItems.map((c) => (
                  <div
                    key={c.id}
                    className="border rounded-xl p-3 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{c.project_name}</span>
                        {getStatusBadge(c.status)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        계약일 {formatDate(c.created_at)}
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-1 text-xs text-muted-foreground">
                      {c.status === "pending" && <span>📝 착공 전: 일정 확정 및 사전 안내 필요</span>}
                      {c.status === "in_progress" && <span>🔧 진행중: 중간 점검 및 사진 기록 권장</span>}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toast({
                            title: "할 일 상세",
                            description: "구체적인 할 일 기능은 추후 투입 예정입니다. (MVP 더미)",
                          })
                        }
                      >
                        메모 / 체크리스트
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
