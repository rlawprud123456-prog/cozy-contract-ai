import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Star, ThumbsUp, MessageCircle, ArrowLeft, 
  Filter, Image as ImageIcon, CheckCircle2, PenLine 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Chatbot from "@/components/Chatbot";

type Review = {
  id: string;
  title: string;
  content: string;
  rating: number;
  created_at: string;
  user_id: string;
  partner_id: string;
  images: string[];
};

export default function Reviews() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState("전체");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      toast({
        title: "리뷰를 불러올 수 없습니다",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 데모 데이터 (DB에 데이터가 없을 경우 표시)
  const demoReviews = [
    {
      id: "1",
      author: "김*수",
      date: "2026.01.15",
      rating: 5,
      content: "처음엔 반신반의했는데 AI 견적부터 시공까지 완벽했습니다. 특히 에스크로 결제라 돈 떼일 걱정 없이 진행한 게 제일 좋았어요. 마감 퀄리티 대박입니다!",
      images: [
        "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=500&q=80",
        "https://images.unsplash.com/photo-1600566752355-35792bedcfe1?w=500&q=80"
      ],
      partner: "공간작업소",
      likes: 12,
      tags: ["친절해요", "마감이 꼼꼼해요"]
    },
    {
      id: "2",
      author: "이*영",
      date: "2026.01.12",
      rating: 4,
      content: "생각보다 공사가 하루 늦어지긴 했지만, 소통이 빨라서 좋았습니다. 자재 변경 요청도 흔쾌히 들어주셨고 결과물도 만족스러워요.",
      images: ["https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=500&q=80"],
      partner: "더 빌드",
      likes: 5,
      tags: ["소통이 잘돼요"]
    },
    {
      id: "3",
      author: "박*호",
      date: "2026.01.10",
      rating: 5,
      content: "30평 아파트 리모델링했는데 친구들이 호텔 같다고 난리네요 ㅎㅎ 표준 계약서 덕분에 추가금 요구도 없었고 아주 깔끔했습니다.",
      images: [],
      partner: "(주)명광",
      likes: 24,
      tags: ["가성비 최고", "디자인 감각"]
    }
  ];

  const displayReviews = reviews.length > 0 
    ? reviews.map(r => ({
        id: r.id,
        author: "익명",
        date: new Date(r.created_at).toLocaleDateString('ko-KR'),
        rating: r.rating,
        content: r.content,
        images: r.images || [],
        partner: "파트너",
        likes: 0,
        tags: []
      }))
    : demoReviews;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">

      {/* 헤더 */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">생생 시공 후기</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 font-bold"
            onClick={() => navigate('/reviews/write')}
          >
            리뷰 작성
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        
        {/* 1. 평점 요약 대시보드 */}
        <Card className="p-6 mb-6 border-0 shadow-lg rounded-3xl bg-white">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-5xl font-black text-gray-900">4.8</p>
              <div className="flex gap-0.5 mt-1 justify-center">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">총 1,234건의 후기</p>
            </div>
            
            <div className="flex-1 space-y-1.5">
              {[5,4,3,2,1].map((score) => (
                <div key={score} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-6">{score}점</span>
                  <Progress value={score === 5 ? 75 : score === 4 ? 18 : 7} className="h-2 flex-1" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 2. 필터 및 태그 */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {["전체", "포토후기", "아파트", "빌라/주택", "상업공간"].map((filter) => (
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
          {displayReviews.map((review) => (
            <Card key={review.id} className="p-5 border-0 shadow-md rounded-3xl bg-white">
              {/* 유저 정보 헤더 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-gray-100">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm font-bold">
                      {review.author[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="font-bold text-gray-800">{review.author}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-400">{review.date}</span>
                    </div>
                    <div className="flex gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                {/* 시공 파트너 배지 */}
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-xs">
                  시공: {review.partner}
                </Badge>
              </div>

              {/* 내용 */}
              <div className="pl-[52px]">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {review.content}
                </p>
                
                {/* 이미지 (있을 경우만) */}
                {review.images.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                        <img src={img} alt="시공 사진" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* 태그 */}
                {review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {review.tags.map((tag) => (
                      <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 하단 액션 */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4 pl-[52px]">
                <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition">
                  <ThumbsUp className="w-4 h-4" /> 
                  <span>도움이 돼요 {review.likes}</span>
                </button>
                {review.images.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <ImageIcon className="w-4 h-4" /> 포토 리뷰
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 글쓰기 버튼 (플로팅) */}
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
