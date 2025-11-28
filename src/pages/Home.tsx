import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Eye, MessageCircle, TrendingUp } from "lucide-react";
import Chatbot from "@/components/Chatbot";

const styles = [
  {
    title: "화이트톤 리폼",
    desc: "밝고 심플한 공간 디자인",
    img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80",
    q: "white",
  },
  {
    title: "우드 포인트 거실",
    desc: "따뜻한 감성의 원목 느낌",
    img: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    q: "wood",
  },
  {
    title: "모던 주방 리모델링",
    desc: "효율적 수납과 감각적 조명",
    img: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800&q=80",
    q: "modern",
  },
  {
    title: "미니멀 침실",
    desc: "간결함 속의 편안함",
    img: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
    q: "minimal",
  },
  {
    title: "북유럽 스타일 거실",
    desc: "자연스러운 채광과 따뜻한 색감",
    img: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80",
    q: "nordic",
  },
  {
    title: "럭셔리 욕실 개조",
    desc: "호텔 같은 고급스러운 공간",
    img: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
    q: "luxury",
  },
];

const reasons = [
  {
    title: "안전한 에스크로",
    desc: "선금·중도금·잔금을 단계별로 보관하고, 검수 완료 시에만 지급합니다."
  },
  {
    title: "AI 계약서 검토",
    desc: "과도한 위약금, 모호한 하자 책임 같은 위험 문구를 자동 표시합니다."
  },
  {
    title: "사기 이력 조회",
    desc: "신고·판결·허가정보·리뷰를 한 화면에서 조회해 리스크를 낮춥니다."
  },
  {
    title: "검증된 전문가",
    desc: "사업자·면허·보험 여부와 실제 시공 사진으로 신뢰를 쌓습니다."
  },
  {
    title: "완전한 투명성",
    desc: "견적 항목, 변경 내역, 일정 지연 사유까지 기록이 남습니다."
  },
  {
    title: "분쟁 예방·대응",
    desc: "표준 계약서 + 증빙 저장 + 중재 프로세스로 초기부터 대비합니다."
  }
];

interface PopularPost {
  id: string;
  title: string;
  category: string;
  created_at: string;
  view_count: number;
  comment_count: number;
  user_name?: string;
  business_name?: string;
  verified?: boolean;
}

const categoryNames: Record<string, string> = {
  sad: "속상해요",
  unfair: "억울해요",
  "diy-tips": "셀프인테리어 팁",
  jobs: "구인구직",
  help: "고수님 도와주세요",
};

interface FeaturedPartner {
  id: string;
  business_name: string;
  category: string;
  description: string | null;
  portfolio_images: string[] | null;
  verified: boolean;
}

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popularPosts, setPopularPosts] = useState<PopularPost[]>([]);
  const [featuredPartners, setFeaturedPartners] = useState<FeaturedPartner[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setAuthed(!!session);
      setLoading(false);
    };

    checkAuth();
    fetchPopularPosts();
    fetchFeaturedPartners();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPopularPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("view_count", { ascending: false })
        .limit(6);

      if (error) throw error;

      // Fetch additional details for each post
      const postsWithDetails = await Promise.all(
        (data || []).map(async (post) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", post.user_id)
            .single();

          const { data: partner } = await supabase
            .from("partners")
            .select("business_name, verified")
            .eq("user_id", post.user_id)
            .single();

          const { count: commentCount } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);

          return {
            id: post.id,
            title: post.title,
            category: post.category,
            created_at: post.created_at,
            view_count: post.view_count,
            comment_count: commentCount || 0,
            user_name: profile?.name,
            business_name: partner?.business_name,
            verified: partner?.verified,
          };
        })
      );

      setPopularPosts(postsWithDetails);
    } catch (error) {
      console.error("인기글 로드 실패:", error);
    }
  };

  const fetchFeaturedPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("id, business_name, category, description, portfolio_images, verified")
        .eq("status", "approved")
        .eq("featured", true)
        .limit(4);

      if (error) throw error;
      setFeaturedPartners(data || []);
    } catch (error) {
      console.error("이달의 전문가 조회 실패:", error);
    }
  };

  const startContract = () => {
    if (!authed) {
      toast({
        title: "로그인이 필요합니다",
        description: "계약서를 작성하려면 먼저 로그인하세요.",
      });
      navigate("/login");
      return;
    }
    navigate("/contract-create");
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold tracking-tight mb-2 sm:mb-3 md:mb-4 text-gray-900">
              당신의 공간을
              <br />
              <span className="text-primary">새롭게</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 mb-4 sm:mb-6 md:mb-8">
              전문가와 함께하는 안전한 인테리어 계약
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 transition w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base"
                onClick={startContract}
              >
                계약 시작하기
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base"
                onClick={() => navigate("/match")}
              >
                전문가 찾기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 새로고침만의 차별성 */}
      <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-4 sm:mb-6 px-2">새로고침만의 차별성</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {reasons.map((r) => (
            <div key={r.title} className="border rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:shadow-lg transition">
              <h3 className="font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">{r.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 증빙 패키지 섹션 */}
      <section className="py-8 sm:py-12 md:py-16 px-3 sm:px-4 bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <Badge className="mb-2 sm:mb-3 bg-primary text-primary-foreground text-xs sm:text-sm">신규 기능</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              소비자 자동 증빙 패키지
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              계약·시공·결제 데이터를 자동으로 타임스탬프 인증하여 법적 효력이 있는 증빙 자료로 보관합니다
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden hover:shadow-xl transition-all">
              <div className="grid md:grid-cols-2 gap-6 p-6 sm:p-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">🔒</span>
                    블록체인 타임스탬프 인증
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>계약서, 현장 사진, 결제 내역 자동 저장</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>변조 불가능한 블록체인 해시값 기록</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>법적 효력이 있는 PDF 리포트 원클릭 생성</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>분쟁 발생 시 즉시 제출 가능한 증빙 자료</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col justify-center gap-4">
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-2">전자문서 및 전자거래 기본법 준수</p>
                    <p className="font-bold text-lg">법적 효력 보장</p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg"
                    onClick={() => navigate("/evidence-package")}
                  >
                    증빙 패키지 시작하기 →
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 이달의 전문가 */}
      <section className="py-6 sm:py-8 md:py-12 lg:py-16 px-3 sm:px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <Badge className="mb-2 sm:mb-3 md:mb-4 bg-accent text-accent-foreground text-xs sm:text-sm">이달의 추천</Badge>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 text-foreground px-2">
              이달의 인테리어 전문가
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              검증된 전문가들이 여러분의 공간을 새롭게 만들어드립니다
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {featuredPartners.map((partner) => (
              <Link
                key={partner.id}
                to={`/partners`}
                className="group block"
              >
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
                  <div className="relative overflow-hidden h-48 bg-muted">
                    {partner.portfolio_images && partner.portfolio_images.length > 0 ? (
                      <img
                        src={partner.portfolio_images[0]}
                        alt={partner.business_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {partner.business_name}
                      {partner.verified && (
                        <Badge variant="secondary" className="text-xs">인증</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{partner.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {partner.description || "믿을 수 있는 전문가입니다"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 새로고침 인증 파트너 */}
      <section className="bg-gray-50 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">새로고침 인증 파트너</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {styles.map((s) => (
              <Link
                key={s.q}
                to={`/partners?style=${encodeURIComponent(s.q)}`}
                className="group border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white"
              >
                <div className="overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 커뮤니티 인기글 */}
      <section className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">커뮤니티 인기글</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm"
            onClick={() => navigate("/community/sad")}
          >
            전체보기 →
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {popularPosts.map((post) => (
            <Card
              key={post.id}
              className="cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate(`/community/post/${post.id}`)}
            >
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {categoryNames[post.category] || post.category}
                  </Badge>
                  {post.verified && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                      ✓ 인증업체
                    </Badge>
                  )}
                </div>
                <CardTitle className="line-clamp-2 hover:text-primary transition">
                  {post.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <span className="text-xs">
                    {post.business_name || post.user_name || "익명"}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span className="text-xs">{post.view_count}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    <span className="text-xs">{post.comment_count}</span>
                  </span>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* 전문가 CTA */}
      <section className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="rounded-2xl sm:rounded-3xl border-2 border-primary/20 p-6 sm:p-10 md:p-16 text-center bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-3xl font-bold mb-3">
            인테리어 전문가이신가요?
          </h3>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
            새로고침 파트너가 되어 더 많은 고객을 만나고,
            <br />
            안전한 결제로 비즈니스를 성장시키세요
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/partner/apply")}
            className="bg-primary hover:bg-primary/90"
          >
            파트너 신청하기 →
          </Button>
        </div>
      </section>

      {/* AI 챗봇 */}
      <Chatbot />
    </div>
  );
}
