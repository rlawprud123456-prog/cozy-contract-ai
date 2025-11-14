import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const { data } = await supabase
        .from("escrow_payments")
        .select("*, contracts(*)")
        .order("created_at", { ascending: false });

      if (data) setPayments(data);
    } catch (error) {
      console.error("Payments loading error:", error);
    }
  };

  const approvePayment = async (id: string) => {
    try {
      const { error } = await supabase
        .from("escrow_payments")
        .update({ status: "released", released_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "결제 승인",
        description: "결제가 승인되었습니다."
      });

      await loadPayments();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      held: "outline",
      pending_approval: "default",
      released: "secondary",
      refunded: "destructive"
    };
    
    const labels: Record<string, string> = {
      held: "보류중",
      pending_approval: "승인대기",
      released: "지급완료",
      refunded: "환불됨"
    };

    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">에스크로 결제 관리</h1>
        <p className="text-muted-foreground mt-2">모든 결제 내역</p>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <Card key={payment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>{payment.type}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {payment.contracts?.title || payment.contracts?.project_name}
                  </p>
                </div>
                {getStatusBadge(payment.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">금액:</span>
                    <span className="font-medium">{payment.amount?.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">생성일:</span>
                    <span>{new Date(payment.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  {payment.released_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">지급일:</span>
                      <span>{new Date(payment.released_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                  )}
                </div>

                {payment.status === "pending_approval" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => approvePayment(payment.id)}
                      size="sm"
                    >
                      승인
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
