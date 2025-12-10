import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Calendar, MapPin, ChevronRight, Phone } from "lucide-react";
import { AppPage } from "@/components/layout/AppPage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { estimates } from "@/services/api";

export default function EstimateRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const { items } = await estimates.getMyRequests();
        setRequests(items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">대기중</Badge>;
      case 'contacted': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">상담 진행중</Badge>;
      case 'done': return <Badge variant="secondary">상담 종료</Badge>;
      default: return <Badge variant="outline">접수됨</Badge>;
    }
  };

  return (
    <AppPage title="내 견적 문의" description="전문가에게 신청한 상담 내역입니다.">
      {loading ? (
        <div className="text-center py-10">로딩 중...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-medium text-lg mb-2">신청한 견적 내역이 없습니다</h3>
          <p className="text-muted-foreground text-sm mb-6">AI 견적 분석을 통해 예상 비용을 확인해보세요.</p>
          <Button asChild>
            <Link to="/estimate">AI 견적 내러 가기</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{req.category || req.project_name} 리모델링 상담</h3>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(req.status)}
                </div>

                <div className="space-y-2 text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg mb-3">
                  <div className="flex justify-between">
                    <span>예산 범위</span>
                    <span className="font-medium text-foreground">{req.estimated_budget ? `${(req.estimated_budget / 10000).toLocaleString()}만원` : '미정'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>시공 지역</span>
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{req.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>연락처</span>
                    <span className="flex items-center"><Phone className="w-3 h-3 mr-1" />{req.phone}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mb-4">
                   💡 {req.description || '견적 상담 요청'}
                </div>

                <Button variant="outline" className="w-full text-sm" asChild>
                  <Link to="/match">
                    <span className="mr-1">비슷한 전문가 더 찾아보기</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppPage>
  );
}
