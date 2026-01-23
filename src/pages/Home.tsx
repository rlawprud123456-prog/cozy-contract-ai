import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Eye, MessageCircle, TrendingUp, ShieldCheck, Activity, Building2 } from "lucide-react";
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

interface PlatformStats {
  totalAmount: number;
  activeContracts: number;
  recentDeals: {
    id: string;
    location: string;
    area: number;
    amount: number;
    type: string; // '계약' or '견적'
    timestamp: string;
  }[];
}

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popularPosts, setPopularPosts] = useState<PopularPost[]>([]);
  const [featuredPartners, setFeaturedPartners] = useState<FeaturedPartner[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalAmount: 0,
    activeContracts: 0,
    recentDeals: []
  });
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
    fetchPlatformStats(); // 통계 데이터 가져오기

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      // 1. 총 누적 계약 금액 및 진행중인 계약 건수 (contracts 테이블)
      const { data: contractData } = await supabase
        .from('contracts')
        .select('total_amount, status');
      
      const totalAmt = contractData?.reduce((sum, c) => sum + (c.total_amount || 0), 0) || 0;
      const activeCnt = contractData?.filter(c => c.status === 'in_progress' || c.status === 'pending').length || 0;

      // 2. 최근 견적/계약 현황 (estimate_requests 테이블 활용 - 평수 정보가 여기 있음)
      const { data: estimateData } = await supabase
        .from('estimate_requests')
        .select('id, location, area, estimated_budget, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const recentDeals = estimateData?.map(e => ({
        id: e.id,
        location: e.location?.split(' ')[0] || "지역 미정",
        area: e.area || 0,
        amount: e.estimated_budget || 0,
        type: '실시간 견적',
        timestamp: e.created_at
      })) || [];

      setStats({
        totalAmount: totalAmt,
        activeContracts: activeCnt,
        recentDeals: recentDeals
      });

    } catch (error) {
      console.error("통계 로드 실패:", error);
    }
  };

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

  // 금액 포맷팅 함수 (억 단위 변환)
  const formatAmount = (num: number) => {
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(1)}억`;
    }
    return `${(num / 10000).toLocaleString()}만`;
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              당신의 공간을
              <br />
              <span className="text-primary">새롭게</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mb-8">
              전문가와 함께하는 안전한 인테리어 계약
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={startContract} className="text-lg px-8">
                계약 시작하기
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 border-white bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm" 
                onClick={() => navigate("/match")}
              >
                전문가 찾기
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* 실시간 플랫폼 현황 (새로 추가된 섹션) */}
      <section className="bg-gradient-to-r from-primary/5 via-blue-50 to-primary/5 py-6 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 누적 거래액 */}
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  누적 안전 결제액
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatAmount(stats.totalAmount)}원+
                </p>
                <p className="text-xs text-green-600">에스크로 보호중</p>
              </div>
            </div>

            {/* 활성 계약 */}
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
               <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  현재 진행중인 공사
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.activeContracts}건
                </p>
                <p className="text-xs text-blue-600">실시간 시공 중</p>
              </div>
            </div>

            {/* 실시간 현황 티커 */}
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                실시간 의뢰 현황
                <Badge variant="secondary" className="ml-1 text-[10px] py-0">LIVE</Badge>
              </p>
              <div className="space-y-1.5 max-h-[60px] overflow-hidden">
                {stats.recentDeals.length > 0 ? (
                  stats.recentDeals.map((deal, idx) => (
                    <div key={deal.id} className="flex justify-between items-center text-xs animate-in slide-in-from-top-2" style={{animationDelay: `${idx * 100}ms`}}>
                      <span className="text-muted-foreground">
                        <Badge variant="outline" className="mr-1 text-[10px] py-0">{deal.type}</Badge>
                        {deal.location}
                        <span className="mx-1">|</span>
                        {deal.area}평
                      </span>
                      <span className="font-medium text-primary">{formatAmount(deal.amount)}원</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">최근 의뢰 내역을 불러오는 중...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 새로고침만의 차별성 */}
      <section className="py-16 bg-white">
        <h3 className="text-2xl font-bold text-center mb-10">새로고침만의 차별성</h3>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          {reasons.map((r) => (
            <Card key={r.title} className="border-0 bg-slate-50 hover:shadow-md transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{r.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {r.desc}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 증빙 패키지 섹션 */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-blue-600 border-blue-200">신규 기능</Badge>
            <h2 className="text-3xl font-bold mb-4">
              소비자 자동 증빙 패키지
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              계약·시공·결제 데이터를 자동으로 타임스탬프 인증하여 법적 효력이 있는 증빙 자료로 보관합니다
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-blue-100 shadow-lg">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="font-semibold">블록체인 타임스탬프 인증</h4>
                    </div>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">✓</span>
                        <span>계약서, 현장 사진, 결제 내역 자동 저장</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">✓</span>
                        <span>변조 불가능한 블록체인 해시값 기록</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">✓</span>
                        <span>법적 효력이 있는 PDF 리포트 원클릭 생성</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">✓</span>
                        <span>분쟁 발생 시 즉시 제출 가능한 증빙 자료</span>
                      </li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-sm text-muted-foreground mb-2">전자문서 및 전자거래 기본법 준수</p>
                      <p className="font-semibold text-blue-600">법적 효력 보장</p>
                    </div>
                    <Button className="mt-4 w-full" variant="default" onClick={() => navigate("/evidence-package")}
                    >
                      증빙 패키지 시작하기 →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 이달의 전문가 */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">이달의 추천</Badge>
            <h2 className="text-3xl font-bold mb-4">
              이달의 인테리어 전문가
            </h2>
            <p className="text-lg text-muted-foreground">
              검증된 전문가들이 여러분의 공간을 새롭게 만들어드립니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPartners.map((partner) => (
              <Link key={partner.id} to={`/partners/detail/${partner.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                  <div className="aspect-[4/3] relative bg-slate-100">
                    {partner.portfolio_images && partner.portfolio_images.length > 0 ? (
                      <img src={partner.portfolio_images[0]} alt={partner.business_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <Building2 className="w-12 h-12 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{partner.business_name}</CardTitle>
                      {partner.verified && (
                        <Badge variant="secondary" className="text-xs">인증</Badge>
                      )}
                    </div>
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
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-bold mb-8 text-center">새로고침 인증 파트너</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {styles.map((s) => (
              <Link key={s.title} to={`/partners?style=${s.q}`}>
                <Card className="overflow-hidden hover:shadow-lg transition group cursor-pointer">
                  <div className="aspect-square overflow-hidden">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <CardContent className="p-3 text-center">
                    <h4 className="font-medium text-sm mb-1">{s.title}</h4>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 커뮤니티 인기글 */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold">커뮤니티 인기글</h3>
            </div>
            <Button variant="ghost" className="text-primary" onClick={() => navigate("/community/sad")}
            >
              전체보기 →
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/community/post/${post.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {categoryNames[post.category] || post.category}
                    </Badge>
                    {post.verified && (
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-600">
                        ✓ 인증업체
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium mb-2 line-clamp-1">
                    {post.title}
                  </h4>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className="truncate max-w-[100px]">
                      {post.business_name || post.user_name || "익명"}
                    </span>
                    <span className="mx-1">·</span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3" />
                      {post.view_count}
                    </span>
                    <span className="flex items-center gap-0.5 ml-2">
                      <MessageCircle className="w-3 h-3" />
                      {post.comment_count}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 전문가 CTA */}
      <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-6">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
          </div>
          <h3 className="text-3xl font-bold mb-4">
            인테리어 전문가이신가요?
          </h3>
          <p className="text-lg text-slate-300 mb-8">
            새로고침 파트너가 되어 더 많은 고객을 만나고,
            <br />
            안전한 결제로 비즈니스를 성장시키세요
          </p>
          <Button size="lg" onClick={() => navigate("/partner/apply")}
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
