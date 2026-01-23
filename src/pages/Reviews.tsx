import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Star, ArrowLeft, PenLine, Ghost
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Chatbot from "@/components/Chatbot";

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  created_at: string;
  partner_id: string;
  images?: string[];
  author_name?: string;
  partner_name?: string;
  tags?: string[];
}

export default function Reviews() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("전체");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // 1. 리뷰 데이터 가져오기 (조인 없이)
      const { data: reviewsData, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (reviewError) throw reviewError;

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        return;
      }

      // 2. 파트너 정보 따로 가져오기 (Manual Join)
      const partnerIds = [...new Set(reviewsData.map(r => r.partner_id).filter(Boolean))];
      
      let partnersMap: Record<string, string> = {};
      
      if (partnerIds.length > 0) {
        const { data: partnersData } = await supabase
          .from('partners')
          .select('id, business_name')
          .in('id', partnerIds);
          
        if (partnersData) {
          partnersData.forEach(p => {
            partnersMap[p.id] = p.business_name;
          });
        }
      }

      // 3. 리뷰 데이터에 파트너 이름 합치기
      const combinedReviews = reviewsData.map(review => ({
        ...review,
        partner_name: review.partner_id ? partnersMap[review.partner_id] : undefined
      }));

      setReviews(combinedReviews);

    } catch (error) {
      console.error("리뷰 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 평점 평균 계산
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, cur) => acc + (cur.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-slate-50 pb-32">

      {/* 헤더 */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">시공 후기</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 font-bold"
            onClick={() => navigate('/reviews/write')}
          >
            작성하기
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        
        {/* 1. 리뷰 통계 */}
        {reviews.length > 0 && (
          <Card className="p-6 mb-6 border-0 shadow-lg rounded-3xl bg-white">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-5xl font-black text-gray-900">{averageRating}</p>
                <div className="flex gap-0.5 mt-1 justify-center">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">총 {reviews.length}건의 후기</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map((score) => {
                  const count = reviews.filter(r => r.rating === score).length;
                  const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={score} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-6">{score}점</span>
                      <Progress value={percent} className="h-2 flex-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* 2. 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {["전체", "아파트", "빌라/주택", "상업공간", "부분시공"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                activeFilter === filter
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* 3. 리뷰 리스트 */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-400 py-10">로딩 중...</p>
          ) : reviews.length === 0 ? (
            <Card className="p-10 border-0 shadow-lg rounded-3xl bg-white text-center">
              <div className="flex justify-center mb-4">
                <Ghost className="w-16 h-16 text-gray-200" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-700">아직 작성된 후기가 없어요</p>
                <p className="text-sm text-gray-400">
                  첫 번째 시공 후기의 주인공이 되어보세요!
                </p>
              </div>
              <Button 
                className="mt-6 bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/reviews/write')}
              >
                가장 먼저 후기 남기기
              </Button>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="p-5 border-0 shadow-md rounded-3xl bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-gray-100">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm font-bold">
                        {review.author_name ? review.author_name[0] : "익"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="font-bold text-gray-800">
                          {review.author_name || "익명"}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* 파트너 이름 표시 */}
                  {review.partner_name && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-xs">
                      {review.partner_name}
                    </Badge>
                  )}
                </div>

                <div className="pl-[52px]">
                  <p className="text-sm font-semibold text-gray-800 mb-1">{review.title}</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {review.content}
                  </p>
                  {review.tags && Array.isArray(review.tags) && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {review.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-20">
        <Button 
          size="lg" 
          className="rounded-full h-14 px-6 shadow-2xl bg-blue-600 hover:bg-blue-700 gap-2"
          onClick={() => navigate('/reviews/write')}
        >
          <PenLine className="w-5 h-5" /> 후기 쓰기
        </Button>
      </div>

      <Chatbot />
    </div>
  );
}
