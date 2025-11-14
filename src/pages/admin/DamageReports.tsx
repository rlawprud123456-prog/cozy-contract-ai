import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DamageReports() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data } = await supabase
        .from("damage_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setReports(data);
    } catch (error) {
      console.error("Damage reports loading error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">피해 신고 관리</h1>
        <p className="text-muted-foreground mt-2">모든 피해 신고 내역</p>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle>{report.business_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">사업자번호:</span>
                    <span>{report.business_license || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">연락처:</span>
                    <span>{report.phone || "-"}</span>
                  </div>
                  {report.amount && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">피해 금액:</span>
                      <span className="font-medium text-destructive">
                        {report.amount.toLocaleString()}원
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">신고일:</span>
                    <span>{new Date(report.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
                
                {report.description && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">상세 내용:</p>
                    <p className="text-sm">{report.description}</p>
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
