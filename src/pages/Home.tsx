import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, ShieldCheck, UserSearch, FileText, 
  Wand2, Home as HomeIcon, AlertTriangle, Menu, Bell,
  ChevronRight, MessageSquare, ThumbsUp, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

// 퀵 메뉴 데이터
const QUICK_MENUS = [
  { icon: UserSearch, label: "전문가 찾기", path: "/match", color: "bg-blue-100 text-blue-600" },
  { icon: ShieldCheck, label: "안전 에스크로", path: "/escrow", color: "bg-green-100 text-green-600" },
  { icon: AlertTriangle, label: "피해사례 조회", path: "/scammer-search", color: "bg-red-100 text-red-600" },
  { icon: Wand2, label: "AI 인테리어", path: "/ai-interior", color: "bg-purple-100 text-purple-600" },
  { icon: FileText, label: "증빙 패키지", path: "/evidence-package", color: "bg-orange-100 text-orange-600" },
  { icon: HomeIcon, label: "시공 사례", path: "/history", color: "bg-gray-100 text-gray-600" },
  { icon: MessageSquare, label: "커뮤니티", path: "/community", color: "bg-yellow-100 text-yellow-600" },
  { icon: Menu, label: "전체 메뉴", path: "/all-menu", color: "bg-slate-100 text-slate-600" },
];

// 이달의 시공사 (우리 플랫폼 파트너 업체 홍보)
const PREMIER_PARTNERS = [
  { 
    id: 1, 
    name: "디자인 스튜디오 숲", 
    tag: "우수 파트너", 
    desc: "30평대 아파트 화이트우드 전문", 
    img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600",
    rating: 4.9 
  },
  { 
    id: 2, 
    name: "어반 인테리어", 
    tag: "상가/카페", 
    desc: "트렌디한 상업공간 리모델링", 
    img: "https://images.unsplash.com/photo-1522771753035-48497c2f6e5c?auto=format&fit=crop&q=80&w=600",
    rating: 4.8 
  },
  { 
    id: 3, 
    name: "공간을 그리다", 
    tag: "인기 시공사", 
    desc: "욕실/주방 부분시공 패키지", 
    img: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
    rating: 5.0 
  },
];

interface CommunityPost {
  id: string;
  title: string;
  category: string;
  like_count: number | null;
  view_count: number | null;
  images: string[] | null;
}

export default function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);

  // 커뮤니티 글 불러오기 (실제 DB 연동)
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('community_posts') 
        .select('id, title, category, like_count, view_count, images')
        .order('like_count', { ascending: false, nullsFirst: false })
        .limit(3);

      if (!error && data) {
        setCommunityPosts(data);
      }
    };

    fetchPosts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) navigate(`/match?keyword=${keyword}`);
  };

  return (
    <div className="pb-24 bg-white min-h-screen">
      {/* 1. 상단 검색바 */}
      <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center gap-3 border-b shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <form onSubmit={handleSearch}>
            <Input 
              className="pl-9 bg-gray-50 border-none h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-gray-200" 
              placeholder="업체명, 시공사례 검색" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </form>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 relative">
          <Bell className="w-6 h-6 text-gray-600" />
        </Button>
      </div>

      {/* 2. 메인 배너 */}
      <div className="relative w-full aspect-[21/9] bg-slate-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80" 
          alt="Banner" 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <Badge className="w-fit mb-2 bg-accent text-white border-none px-2 py-0.5">안전 시공 캠페인</Badge>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            인테리어 시공사 스트레스 끝!<br />
            <span className="text-accent">준비된 시공자</span>들과 안전하게
          </h2>
          <p className="text-white/80 text-xs sm:text-sm mt-1">
            검증된 전문가 매칭부터 에스크로 안전결제까지
          </p>
        </div>
      </div>

      {/* 3. 퀵 메뉴 */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-4 gap-y-6 gap-x-2">
          {QUICK_MENUS.map((menu, idx) => (
            <Link key={idx} to={menu.path} className="flex flex-col items-center gap-2 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-active:scale-95 ${menu.color}`}>
                <menu.icon className="w-7 h-7" />
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-gray-700 text-center tracking-tight">
                {menu.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="h-2 bg-gray-50" />

      {/* 4. 우리 동네 인기 전문가 */}
      <section className="py-8 pl-4">
        <div className="flex justify-between items-center pr-4 mb-4">
          <h3 className="font-bold text-lg text-slate-900">우리 동네 인기 전문가 🔥</h3>
          <Link to="/match" className="text-xs text-gray-500 hover:text-gray-900 flex items-center">
            전체보기 <ChevronRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 pr-4 scrollbar-hide">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <Link key={i} to={`/partner/${i}`} className="shrink-0 w-[150px]">
              <div className="rounded-lg overflow-hidden aspect-[4/3] mb-2 relative">
                <img 
                  src={`https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=300&text=${i}`} 
                  alt="Partner" 
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm border-none text-[10px] h-5 px-1.5 text-white">
                  ★ 4.{8-i}
                </Badge>
              </div>
              <h4 className="font-bold text-sm truncate">믿음 인테리어 {i+1}호점</h4>
              <p className="text-xs text-gray-500 truncate">서울 • 아파트/빌라 전문</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. 이달의 인테리어 시공사 (우리 파트너 홍보 배너) */}
      <section className="py-6 pl-4 bg-blue-50/50">
        <div className="pr-4 mb-4 pt-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-slate-900">이달의 인테리어 시공사</h3>
            <Badge variant="secondary" className="text-[10px] h-5 bg-white border">AD</Badge>
          </div>
          <p className="text-xs text-gray-500">고객님들이 가장 만족한 이달의 파트너입니다</p>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 pr-4 scrollbar-hide">
          {PREMIER_PARTNERS.map((partner) => (
            <div key={partner.id} className="shrink-0 w-[280px] group cursor-pointer bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="aspect-[2/1] relative overflow-hidden">
                <img 
                  src={partner.img} 
                  alt={partner.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <Badge className="absolute top-3 left-3 bg-blue-600 border-none text-[10px]">{partner.tag}</Badge>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-base text-slate-900">{partner.name}</h4>
                  <div className="flex items-center text-yellow-500 text-xs font-bold">
                    <Star className="w-3 h-3 fill-current mr-0.5" />{partner.rating}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-1">{partner.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-2 bg-gray-50" />

      {/* 6. 실시간 피해사례 주의 */}
      <section className="py-8 pl-4">
        <div className="flex justify-between items-center pr-4 mb-4">
          <h3 className="font-bold text-lg text-slate-900">실시간 피해사례 주의 🚨</h3>
          <Link to="/scammer-search" className="text-xs text-gray-500 hover:text-gray-900 flex items-center">
            더보기 <ChevronRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        <div className="flex overflow-x-auto gap-3 pb-4 pr-4 scrollbar-hide">
          {[1, 2, 3].map((_, i) => (
            <Card key={i} className="shrink-0 w-[240px] border-l-4 border-l-red-500 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">주의</Badge>
                  <span className="text-xs text-gray-400">2시간 전</span>
                </div>
                <p className="font-bold text-sm mb-1 line-clamp-1">선금 받고 연락 두절 (강남구)</p>
                <p className="text-xs text-gray-500 mb-2">010-****-1234 (김*수)</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="h-2 bg-gray-50" />

      {/* 7. 지금 뜨는 이야기 (커뮤니티 실제 연동) */}
      <section className="py-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-900">지금 뜨는 이야기 💬</h3>
          <Link to="/community" className="text-xs text-gray-500 hover:text-gray-900">전체보기</Link>
        </div>

        <div className="space-y-4">
          {communityPosts.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              아직 등록된 게시글이 없습니다. <br />
              <Link to="/community" className="underline text-blue-500">첫 글을 남겨보세요!</Link>
            </div>
          ) : (
            communityPosts.map((post, i) => (
              <div key={post.id}>
                <div 
                  onClick={() => navigate(`/community/post/${post.id}`)} 
                  className="cursor-pointer flex gap-3 items-start py-1"
                >
                  <div className="font-bold text-lg text-accent italic w-4 text-center">{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium mb-1 truncate">{post.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center">
                        <ThumbsUp className="w-3 h-3 mr-1" /> {post.like_count || 0}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1" /> {post.view_count || 0}
                      </span>
                      <span>{post.category}</span>
                    </div>
                  </div>
                  {post.images && post.images[0] && (
                    <div className="w-16 h-16 rounded bg-gray-100 shrink-0 overflow-hidden">
                      <img 
                        src={post.images[0]} 
                        className="w-full h-full object-cover" 
                        alt="thumbnail" 
                      />
                    </div>
                  )}
                </div>
                {i < communityPosts.length - 1 && <Separator className="mt-4" />}
              </div>
            ))
          )}
        </div>
      </section>
      
      <div className="h-4" />
    </div>
  );
}
