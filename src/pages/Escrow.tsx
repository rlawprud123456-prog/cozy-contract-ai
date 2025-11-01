import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { contractManagement, escrow } from "@/services/api";
import { Shield, CheckCircle2, Clock, Ban, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Contract {
  id: number;
  projectName: string;
  partnerName: string;
  totalAmount: number;
  depositAmount: number;
  midAmount: number;
  finalAmount: number;
  status: string;
  createdAt: string;
}

interface Payment {
  id: number;
  contractId: number;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  releasedAt?: string;
  refundedAt?: string;
}

interface EscrowProps {
  user: any;
}

export default function Escrow({ user }: EscrowProps) {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<{ [key: number]: Payment[] }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const { items } = await contractManagement.list();
      setContracts(items);

      // 각 계약의 결제 내역 로드
      const paymentsMap: { [key: number]: Payment[] } = {};
      for (const contract of items) {
        const { items: paymentItems } = await escrow.getByContract(contract.id);
        paymentsMap[contract.id] = paymentItems;
      }
      setPayments(paymentsMap);
    } catch (error) {
      console.error("계약 로드 실패:", error);
    }
  };

  const handleDeposit = async (contractId: number, amount: number, type: string) => {
    setLoading(true);
    try {
      await escrow.deposit({ contractId, amount, type });
      toast({
        title: "입금 완료",
        description: "에스크로 계좌에 안전하게 보관되었습니다",
      });
      
      // 계약 상태 업데이트
      if (type === "deposit") {
        await contractManagement.updateStatus(contractId, "in_progress");
      }
      
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

  const handleRelease = async (paymentId: number, contractId: number) => {
    setLoading(true);
    try {
      await escrow.release(paymentId);
      toast({
        title: "지급 완료",
        description: "전문가에게 대금이 지급되었습니다",
      });

      // 모든 결제가 완료되었는지 확인
      const { items: paymentItems } = await escrow.getByContract(contractId);
      const allReleased = paymentItems.every(p => p.status === "released");
      if (allReleased) {
        await contractManagement.updateStatus(contractId, "completed");
      }

      await loadContracts();
    } catch (error) {
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "지급에 실패했습니다",
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
          <Link to="/contract/create">
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
              <Link to="/contract/create">
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
                        <CardTitle className="text-xl">{contract.projectName}</CardTitle>
                        <CardDescription>
                          전문가: {contract.partnerName} | 총액: {contract.totalAmount.toLocaleString()}원
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
                            {contract.depositAmount.toLocaleString()}원
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {hasDeposit ? (
                            <div className="space-y-2">
                              {getPaymentStatusBadge(contractPayments.find(p => p.type === "deposit")?.status || "")}
                              {contractPayments.find(p => p.type === "deposit")?.status === "held" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => handleRelease(contractPayments.find(p => p.type === "deposit")!.id, contract.id)}
                                  disabled={loading}
                                >
                                  지급하기
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full bg-accent hover:bg-accent/90"
                              onClick={() => handleDeposit(contract.id, contract.depositAmount, "deposit")}
                              disabled={loading || contract.status !== "pending"}
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
                            {contract.midAmount.toLocaleString()}원
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {hasMid ? (
                            <div className="space-y-2">
                              {getPaymentStatusBadge(contractPayments.find(p => p.type === "mid")?.status || "")}
                              {contractPayments.find(p => p.type === "mid")?.status === "held" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => handleRelease(contractPayments.find(p => p.type === "mid")!.id, contract.id)}
                                  disabled={loading}
                                >
                                  지급하기
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full bg-accent hover:bg-accent/90"
                              onClick={() => handleDeposit(contract.id, contract.midAmount, "mid")}
                              disabled={loading || !hasDeposit || contract.status === "pending"}
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
                            {contract.finalAmount.toLocaleString()}원
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {hasFinal ? (
                            <div className="space-y-2">
                              {getPaymentStatusBadge(contractPayments.find(p => p.type === "final")?.status || "")}
                              {contractPayments.find(p => p.type === "final")?.status === "held" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => handleRelease(contractPayments.find(p => p.type === "final")!.id, contract.id)}
                                  disabled={loading}
                                >
                                  지급하기
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full bg-accent hover:bg-accent/90"
                              onClick={() => handleDeposit(contract.id, contract.finalAmount, "final")}
                              disabled={loading || !hasMid || contract.status === "pending"}
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
                                <span className="font-medium">{getPaymentTypeLabel(payment.type)}</span>
                                <span className="text-muted-foreground">
                                  {payment.amount.toLocaleString()}원
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
