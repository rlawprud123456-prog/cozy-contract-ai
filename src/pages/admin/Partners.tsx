import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X, MapPin, Phone, Calendar, Trash2 } from "lucide-react";

export default function Partners() {
  const [partners, setPartners] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setPartners(data);
    } catch (error) {
      console.error("파트너 목록 로딩 실패:", error);
    }
  };

  // 파트너 삭제 함수
  const deletePartner = async (id: string, name: string) => {
    if (!window.confirm(`'${name}' 업체를 정말 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.`)) {
      return;
    }

    setProcessingId(id);
    try {
      const { error } = await supabase
        .from("partners")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "파트너 정보가 영구적으로 삭제되었습니다.",
      });

      await loadPartners();
    } catch (error: any) {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected", name: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from("partners")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: status === "approved" ? "파트너 승인 완료" : "파트너 신청 거절",
        description: `${name}님의 상태가 변경되었습니다.`,
        variant: status === "approved" ? "default" : "destructive",
      });

      await loadPartners();
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-600">승인됨</Badge>;
      case "rejected":
        return <Badge variant="destructive">거절됨</Badge>;
      default:
        return <Badge variant="outline">승인 대기중</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">바로고침 파트너 관리</h1>
        <p className="text-muted-foreground">
          총 {partners.length}건의 신청이 있습니다.
        </p>
      </div>

      <div className="grid gap-4">
        {partners.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              아직 파트너 신청 내역이 없습니다.
            </CardContent>
          </Card>
        ) : (
          partners.map((partner) => (
            <Card key={partner.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{partner.business_name}</CardTitle>
                      {getStatusBadge(partner.status)}
                    </div>
                    <CardDescription>{partner.category} 전문</CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    {partner.status === "pending" && (
                      <>
                        <Button
                          onClick={() => updateStatus(partner.id, "approved", partner.business_name)}
                          disabled={!!processingId}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          승인
                        </Button>
                        <Button
                          onClick={() => updateStatus(partner.id, "rejected", partner.business_name)}
                          disabled={!!processingId}
                          variant="destructive"
                          size="sm"
                        >
                          <X className="w-4 h-4 mr-1" />
                          거절
                        </Button>
                      </>
                    )}
                    {/* 삭제 버튼 - 모든 상태에서 표시 */}
                    <Button
                      onClick={() => deletePartner(partner.id, partner.business_name)}
                      disabled={!!processingId}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {partner.phone || "연락처 없음"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {partner.location || "지역 정보 없음"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      신청일: {new Date(partner.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">업체 소개</p>
                    <p className="text-sm text-muted-foreground">
                      {partner.description || "소개글이 없습니다."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
