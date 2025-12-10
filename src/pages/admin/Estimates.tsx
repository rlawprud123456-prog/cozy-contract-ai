import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { adminEstimates } from "@/services/api";
import { Phone, MapPin, Calendar, CheckCircle2 } from "lucide-react";

export default function Estimates() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { items } = await adminEstimates.getAllRequests();
      setRequests(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await adminEstimates.updateStatus(id, newStatus);
      toast({ title: "상태 변경 완료", description: "처리 상태가 업데이트되었습니다." });
      loadData();
    } catch (e) {
      toast({ title: "오류", description: "상태 변경 실패", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">신규 접수</Badge>;
      case 'contacted': return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">상담 중</Badge>;
      case 'done': return <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-300">상담 종료</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <div className="p-6">로딩 중...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">견적 문의 관리</h1>
        <p className="text-muted-foreground mt-2">고객들이 신청한 AI 견적 상담 내역입니다. (총 {requests.length}건)</p>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              아직 접수된 견적 문의가 없습니다.
            </CardContent>
          </Card>
        ) : (
          requests.map((req) => (
            <Card key={req.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-4 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg">{req.client_name || "고객"}님의 {req.category} 견적</span>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(req.created_at).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <Select 
                    defaultValue={req.status} 
                    onValueChange={(val) => handleStatusChange(req.id, val)}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">신규 접수</SelectItem>
                      <SelectItem value="contacted">상담 중</SelectItem>
                      <SelectItem value="done">상담 종료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-4 grid md:grid-cols-2 gap-6">
                <div className="space-y-3 text-sm">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-primary" /> 상세 정보
                  </h4>
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-muted-foreground">프로젝트:</span>
                    <span className="font-medium">{req.project_name}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-muted-foreground">면적:</span>
                    <span>{req.area}평</span>
                  </div>
                  {req.estimated_budget && (
                    <div className="grid grid-cols-[80px_1fr] gap-1">
                      <span className="text-muted-foreground">예산:</span>
                      <span className="font-medium text-primary">{req.estimated_budget.toLocaleString()}원</span>
                    </div>
                  )}
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-muted-foreground">지역:</span>
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{req.location}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-muted-foreground">연락처:</span>
                    <span className="flex items-center font-bold"><Phone className="w-3 h-3 mr-1" />{req.phone}</span>
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  <span className="text-xs text-muted-foreground block mb-1">요청 설명</span>
                  <p className="text-foreground">{req.description || "설명 없음"}</p>
                  
                  <div className="mt-4 pt-4 border-t border-border flex justify-end gap-2">
                     <Button variant="outline" size="sm">파트너 연결</Button>
                     <Button size="sm">직접 전화걸기</Button>
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
