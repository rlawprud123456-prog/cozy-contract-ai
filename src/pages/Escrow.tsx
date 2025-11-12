import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { listContracts, updateContractStatus } from "@/services/contract";
import { depositPayment, getPaymentsByContract, requestApproval } from "@/services/escrow";
import { Shield, CheckCircle2, Clock, Ban, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Contract = Tables<"contracts">;
type Payment = Tables<"escrow_payments">;

interface EscrowProps {
  user: any;
}

export default function Escrow({ user }: EscrowProps) {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<{ [key: string]: Payment[] }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const items = await listContracts();
      setContracts(items);

      // 각 계약의 결제 내역 로드
      const paymentsMap: { [key: string]: Payment[] } = {};
      for (const contract of items) {
        const paymentItems = await getPaymentsByContract(contract.id);
        paymentsMap[contract.id] = paymentItems;
      }
      setPayments(paymentsMap);
    } catch (error) {
      console.error("계약 로드 실패:", error);
    }
  };

  const handleDeposit = async (
    contractId: string,
    amount: number,
    type: "deposit" | "mid" | "final"
  ) => {
    setLoading(true);
    try {
      await depositPayment({ contract_id: contractId, amount, type });
      toast({
        title: "입금 완료",
        description: "에스크로 계좌에 안전하게 보관되었습니다",
      });

      await loadContracts();
    } catch (error) {
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "입금에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestApproval = async (paymentId: string) => {
    setLoading(true);
    try {
      await requestApproval(paymentId);
      toast({
        title: "승인 요청 완료",
        description: "관리자 승인 후 전문가에게 대금이 지급됩니다",
      });

      await loadContracts();
    } catch (error) {
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "승인 요청에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />대기중</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500"><ArrowRight className="w-3 h-3 mr-1" />진행중</Badge>;
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />완료</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500"><Ban className="w-3 h-3 mr-1" />취소</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "held":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">보관중</Badge>;
      case "pending_approval":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">승인 대기중</Badge>;
      case "released":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">지급완료</Badge>;
      case "refunded":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">환불완료</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "deposit": return "선금";
      case "mid": return "중도금";
      case "final": return "잔금";
      default: return type;
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-8 h-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              에스크로 결제 관리
            </h1>
          </div>
          <p className="text-muted-foreground mb-4">
            안전한 단계별 결제 시스템으로 프로젝트를 진행하세요
          </p>
          <Link to="/contract-create">
            <Button className="bg-accent hover:bg-accent/90">
              새 계약 생성하기
            </Button>
          </Link>
        </div>

        {contracts.length === 0 ? (
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="py-12 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">등록된 계약이 없습니다</p>
              <Link to="/contract-create">
                <Button variant="outline">계약 생성하기</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {contracts.map((contract) => {
              const contractPayments = payments[contract.id] || [];
              const hasDeposit = contractPayments.some(p => p.type === "deposit");
              const hasMid = contractPayments.some(p => p.type === "mid");
              const hasFinal = contractPayments.some(p => p.type === "final");

              return (
                <Card key={contract.id} className="shadow-[var(--shadow-card)]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{contract.project_name || "프로젝트"}</CardTitle>
                        <CardDescription>
                          전문가: {contract.partner_name || "미정"} | 총액:{" "}
                          {(contract.total_amount || 0).toLocaleString()}원
                        </CardDescription>
                      </div>
                      {getStatusBadge(contract.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 결제 단계 */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* 선금 */}
                      <Card className="bg-secondary/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">선금</CardTitle>
                          <CardDescription className="text-lg font-bold text-foreground">
                            {(contract.deposit_amount || 0).toLocaleString()}원
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {hasDeposit ? (
                            <div className="space-y-2">
                              {getPaymentStatusBadge(
                                contractPayments.find((p) => p.type === "deposit")?.status || ""
                              )}
                              {contractPayments.find((p) => p.type === "deposit")?.status === "held" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() =>
                                    handleRequestApproval(
                                      contractPayments.find((p) => p.type === "deposit")!.id
                                    )
                                  }
                                  disabled={loading}
                                >
                                  승인 요청
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full bg-accent hover:bg-accent/90"
                              onClick={() =>
                                handleDeposit(contract.id, contract.deposit_amount || 0, "deposit")
                              }
                              disabled={loading || contract.status !== "pending" || hasDeposit}
                            >
                              입금하기
                            </Button>
                          )}
                        </CardContent>
                      </Card>

                      {/* 중도금 */}
                      <Card className="bg-secondary/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">중도금</CardTitle>
                          <CardDescription className="text-lg font-bold text-foreground">
                            {(contract.mid_amount || 0).toLocaleString()}원
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {hasMid ? (
                            <div className="space-y-2">
                              {getPaymentStatusBadge(
                                contractPayments.find((p) => p.type === "mid")?.status || ""
                              )}
                              {contractPayments.find((p) => p.type === "mid")?.status === "held" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() =>
                                    handleRequestApproval(
                                      contractPayments.find((p) => p.type === "mid")!.id
                                    )
                                  }
                                  disabled={loading}
                                >
                                  승인 요청
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full bg-accent hover:bg-accent/90"
                              onClick={() =>
                                handleDeposit(contract.id, contract.mid_amount || 0, "mid")
                              }
                              disabled={loading || !hasDeposit || hasMid || contract.status === "pending"}
                            >
                              입금하기
                            </Button>
                          )}
                        </CardContent>
                      </Card>

                      {/* 잔금 */}
                      <Card className="bg-secondary/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">잔금</CardTitle>
                          <CardDescription className="text-lg font-bold text-foreground">
                            {(contract.final_amount || 0).toLocaleString()}원
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {hasFinal ? (
                            <div className="space-y-2">
                              {getPaymentStatusBadge(
                                contractPayments.find((p) => p.type === "final")?.status || ""
                              )}
                              {contractPayments.find((p) => p.type === "final")?.status === "held" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() =>
                                    handleRequestApproval(
                                      contractPayments.find((p) => p.type === "final")!.id
                                    )
                                  }
                                  disabled={loading}
                                >
                                  승인 요청
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full bg-accent hover:bg-accent/90"
                              onClick={() =>
                                handleDeposit(contract.id, contract.final_amount || 0, "final")
                              }
                              disabled={loading || !hasMid || hasFinal || contract.status === "pending"}
                            >
                              입금하기
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* 결제 내역 */}
                    {contractPayments.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-semibold mb-2">결제 내역</h4>
                        <div className="space-y-2">
                          {contractPayments.map((payment) => (
                            <div
                              key={payment.id}
                              className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {getPaymentTypeLabel(payment.type)}
                                </span>
                                <span className="text-muted-foreground">
                                  {(payment.amount || 0).toLocaleString()}원
                                </span>
                              </div>
                              {getPaymentStatusBadge(payment.status)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
