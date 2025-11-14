import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Partners() {
  const [partners, setPartners] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const { data } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setPartners(data);
    } catch (error) {
      console.error("Partners loading error:", error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("partners")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "상태 업데이트",
        description: `파트너 상태가 ${status}로 변경되었습니다.`
      });

      await loadPartners();
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
      pending: "outline",
      approved: "default",
      rejected: "destructive"
    };
    
    const labels: Record<string, string> = {
      pending: "대기중",
      approved: "승인됨",
      rejected: "거부됨"
    };

    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">파트너 관리</h1>
        <p className="text-muted-foreground mt-2">파트너 신청 및 관리</p>
      </div>

      <div className="space-y-4">
        {partners.map((partner) => (
          <Card key={partner.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>{partner.business_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{partner.category}</p>
                </div>
                {getStatusBadge(partner.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">이메일:</span>
                    <span>{partner.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">전화번호:</span>
                    <span>{partner.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">신청일:</span>
                    <span>{new Date(partner.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
                
                {partner.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => updateStatus(partner.id, "approved")}
                      size="sm"
                    >
                      승인
                    </Button>
                    <Button
                      onClick={() => updateStatus(partner.id, "rejected")}
                      variant="destructive"
                      size="sm"
                    >
                      거부
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
