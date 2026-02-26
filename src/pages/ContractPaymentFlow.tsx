import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PenTool, Lock, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ContractPaymentFlow() {
  const { toast } = useToast();
  const [step, setStep] = useState<"sign" | "pay" | "done">("sign");
  const [contractId, setContractId] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingContract();
  }, []);

  const fetchPendingContract = async () => {
    try {
      const { data } = await supabase
        .from("contracts")
        .select("id, total_amount")
        .eq("status", "pending")
        .limit(1)
        .maybeSingle();

      if (data) {
        setContractId(data.id);
        setTotalAmount(data.total_amount || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = () => {
    setStep("pay");
  };

  const handlePayment = async () => {
    if (!contractId) {
      toast({ title: "오류", description: "계약 정보가 없습니다.", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from("contracts")
        .update({ status: "in_progress" })
        .eq("id", contractId);

      if (error) throw error;

      setStep("done");
    } catch (error: any) {
      toast({ title: "결제 오류", description: error.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">계약서 불러오는 중...</p></div>;

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-6">

        {step === "sign" && (
          <Card className="p-6 border-0 shadow-lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">전자 계약서 서명</h2>
              <p className="text-sm text-muted-foreground mt-1">계약 내용을 확인하시고 서명을 진행해주세요.</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 mb-6 min-h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm">계약서 상세 내용 (금액: {totalAmount.toLocaleString()}원)</p>
            </div>

            <Button className="w-full h-12 text-base font-bold" onClick={handleSign}>
              <PenTool className="w-5 h-5 mr-2" />
              계약서에 서명하기 (터치/클릭)
            </Button>
          </Card>
        )}

        {step === "pay" && (
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground">에스크로 안전 결제</h2>
              <p className="text-sm text-muted-foreground mt-1">서명이 완료되었습니다. 안전하게 대금을 예치해주세요.</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">총 결제 금액</span>
                <span className="font-bold text-foreground">{totalAmount.toLocaleString()}원</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">예치 기관</span>
                <span className="font-bold text-foreground">바로고침 안심 에스크로</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20 mb-6">
              <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  대금은 공사가 끝날 때까지 안전하게 보관됩니다.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  고객님이 '시공 완료'를 승인해야만 업체로 돈이 전달됩니다.
                </p>
              </div>
            </div>

            <Button className="w-full h-12 text-base font-bold" onClick={handlePayment}>
              안심 에스크로 예치하기 <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        )}

        {step === "done" && (
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex flex-col items-center text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-xl font-bold text-foreground">결제 예치가 완료되었습니다!</h2>
              <p className="text-sm text-muted-foreground mt-2">에스크로 예치 완료. 이제 안심하고 공사를 시작하세요.</p>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
