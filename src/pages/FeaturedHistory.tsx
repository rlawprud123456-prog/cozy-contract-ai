import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface FeaturedHistoryItem {
  id: string;
  partner_id: string;
  featured_at: string;
  unfeatured_at: string | null;
  partner: {
    business_name: string;
    category: string;
    portfolio_images: string[] | null;
  };
}

export default function FeaturedHistory() {
  const [history, setHistory] = useState<FeaturedHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("featured_history")
        .select(`
          id,
          partner_id,
          featured_at,
          unfeatured_at,
          partner:partners (
            business_name,
            category,
            portfolio_images
          )
        `)
        .order("featured_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      toast({
        title: "데이터 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy년 MM월 dd일 HH:mm", { locale: ko });
  };

  const getDuration = (start: string, end: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${days}일간`;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            관리자 페이지로
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Star className="w-6 h-6 fill-current text-yellow-500" />
              이달의 전문가 선정 히스토리
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                로딩 중...
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                선정 히스토리가 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-48 h-48 md:h-auto">
                        <img
                          src={
                            item.partner.portfolio_images?.[0] ||
                            "/placeholder.svg"
                          }
                          alt={item.partner.business_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-2">
                              {item.partner.business_name}
                            </h3>
                            <Badge variant="secondary" className="mb-2">
                              {item.partner.category}
                            </Badge>
                          </div>
                          {!item.unfeatured_at && (
                            <Badge className="gap-1 bg-yellow-500">
                              <Star className="w-3 h-3 fill-current" />
                              현재 선정중
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">선정일:</span>
                            <span>{formatDate(item.featured_at)}</span>
                          </div>
                          
                          {item.unfeatured_at && (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">해제일:</span>
                                <span>{formatDate(item.unfeatured_at)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">선정 기간:</span>
                                <span>{getDuration(item.featured_at, item.unfeatured_at)}</span>
                              </div>
                            </>
                          )}
                          
                          {!item.unfeatured_at && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">선정 기간:</span>
                              <span>{getDuration(item.featured_at, null)} (진행중)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
