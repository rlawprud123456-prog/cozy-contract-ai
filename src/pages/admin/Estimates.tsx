import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Estimates() {
  const [estimates, setEstimates] = useState<any[]>([]);

  useEffect(() => {
    loadEstimates();
  }, []);

  const loadEstimates = async () => {
    try {
      const { data } = await supabase
        .from("estimate_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setEstimates(data);
    } catch (error) {
      console.error("Estimates loading error:", error);
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
        <h1 className="text-3xl font-bold">견적 요청 관리</h1>
        <p className="text-muted-foreground mt-2">모든 견적 요청 내역</p>
      </div>

      <div className="space-y-4">
        {estimates.map((estimate) => (
          <Card key={estimate.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>{estimate.project_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{estimate.category}</p>
                </div>
                {getStatusBadge(estimate.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">의뢰인:</span>
                  <span>{estimate.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">연락처:</span>
                  <span>{estimate.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">위치:</span>
                  <span>{estimate.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">면적:</span>
                  <span>{estimate.area}평</span>
                </div>
                {estimate.estimated_budget && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">예상 예산:</span>
                    <span className="font-medium">{estimate.estimated_budget.toLocaleString()}원</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">요청일:</span>
                  <span>{new Date(estimate.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
