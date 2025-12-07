import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, ShieldCheck, UserSearch, FileText, 
  Wand2, Home as HomeIcon, AlertTriangle, Menu, Bell,
  ChevronRight, MessageSquare, ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

// 퀵 메뉴 데이터 (아이콘 + 라벨)
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

// 이달의 인테리어 (매거진) 데이터
const MAGAZINE_ITEMS = [
  { id: 1, title: "20평대 구축 아파트의 기적", desc: "화이트&우드로 넓어보이게", img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80" },
  { id: 2, title: "플랜테리어 시작하기", desc: "식물로 채우는 생기있는 공간", img: "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?auto=format&fit=crop&q=80" },
  { id: 3, title: "호텔 같은 욕실 만들기", desc: "조명 하나로 분위기 반전", img: "https://images.unsplash.com/photo-1552321901-700977eeadd0?auto=format&fit=crop&q=80" },
];

interface FeaturedPartner {
  id: string;
  business_name: string;
  category: string;
  description: string | null;
  portfolio_images: string[] | null;
}

export default function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [featuredPartners, setFeaturedPartners] = useState<FeaturedPartner[]>([]);

  useEffect(() => {
    const fetchFeaturedPartners = async () => {
      const { data } = await supabase
        .from("partners")
        .select("id, business_name, category, description, portfolio_images")
        .eq("status", "approved")
        .eq("featured", true)
        .limit(5);
      
      if (data) setFeaturedPartners(data);
    };

    fetchFeaturedPartners();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) navigate(`/match?keyword=${keyword}`);
  };

  return (
    <div className="pb-24 bg-white min-h-screen">
      {/* 1. 상단 검색바 & 알림 (앱 스타일 헤더) */}
      <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center gap-3 border-b shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <form onSubmit={handleSearch}>
            <Input 
              className="pl-9 bg-gray-50 border-none h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-gray-200" 
              placeholder="인테리어 업체, 시공사례 검색" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </form>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 relative">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
      </div>

      {/* 2. 메인 배너 (문구 변경됨) */}
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

      {/* 3. 퀵 메뉴 그리드 */}
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

      <div className="h-2 bg-gray-50" /> {/* 구분선 */}

      {/* 4. 우리 동네 인기 전문가 */}
      <section className="py-8 pl-4">
        <div className="flex justify-between items-center pr-4 mb-4">
          <h3 className="font-bold text-lg text-slate-900">우리 동네 인기 전문가 🔥</h3>
          <Link to="/match" className="text-xs text-gray-500 hover:text-gray-900 flex items-center">
            전체보기 <ChevronRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 pr-4 scrollbar-hide">
          {featuredPartners.length > 0 ? (
            featuredPartners.map((partner) => (
              <Link key={partner.id} to={`/partners`} className="shrink-0 w-[150px]">
                <div className="rounded-lg overflow-hidden aspect-[4/3] mb-2 relative bg-gray-100">
                  {partner.portfolio_images?.[0] ? (
                    <img 
                      src={partner.portfolio_images[0]} 
                      alt={partner.business_name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <HomeIcon className="w-8 h-8" />
                    </div>
                  )}
                  <Badge className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm border-none text-[10px] h-5 px-1.5 text-white">
                    {partner.category}
                  </Badge>
                </div>
                <h4 className="font-bold text-sm truncate">{partner.business_name}</h4>
                <p className="text-xs text-gray-500 truncate">{partner.description || "인테리어 전문"}</p>
              </Link>
            ))
          ) : (
            [1, 2, 3, 4, 5].map((_, i) => (
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
                <h4 className="font-bold text-sm truncate">디자인 스튜디오 {i+1}</h4>
                <p className="text-xs text-gray-500 truncate">서울 강남구 • 전체 리모델링</p>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* 5. [NEW] 이달의 인테리어 (매거진 스타일) */}
      <section className="py-2 pl-4">
        <div className="pr-4 mb-4">
          <h3 className="font-bold text-lg text-slate-900">이달의 인테리어 🏠</h3>
          <p className="text-xs text-gray-500">요즘 뜨는 스타일을 확인해보세요</p>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 pr-4 scrollbar-hide">
          {MAGAZINE_ITEMS.map((item) => (
            <div key={item.id} className="shrink-0 w-[280px] group cursor-pointer">
              <div className="rounded-xl overflow-hidden aspect-[16/9] mb-3 relative">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="font-bold text-base leading-tight mb-0.5">{item.title}</h4>
                  <p className="text-xs text-white/80 font-light">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-2 bg-gray-50" />

      {/* 6. 실시간 피해사례 주의 (제목 변경) */}
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
                <div className="flex items-center text-[11px] text-gray-400 bg-gray-50 p-2 rounded">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  계약 전 반드시 실명인증 하세요!
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="h-2 bg-gray-50" />

      {/* 7. [NEW] 인기 커뮤니티 글 */}
      <section className="py-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-900">지금 뜨는 이야기 💬</h3>
          <Link to="/community" className="text-xs text-gray-500 hover:text-gray-900">전체보기</Link>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i}>
              <div className="flex gap-3 items-start py-1">
                <div className="font-bold text-lg text-accent italic w-4 text-center">{i+1}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium mb-1 truncate">
                    {i === 0 ? "인테리어 견적 3000만원, 이게 맞나요? ㅠㅠ" : 
                     i === 1 ? "셀프 페인트칠하다가 망했습니다 살려주세요" : 
                     "오늘의집 같은 분위기 내려면 조명 뭐 써야하나요?"}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center"><ThumbsUp className="w-3 h-3 mr-1" /> {120 - i*20}</span>
                    <span className="flex items-center"><MessageSquare className="w-3 h-3 mr-1" /> {45 - i*5}</span>
                    <span>자유게시판</span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded bg-gray-100 shrink-0 overflow-hidden">
                   <img src={`https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=100&text=${i}`} className="w-full h-full object-cover" alt="thumbnail" />
                </div>
              </div>
              {i < 2 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </section>
      
      {/* 하단 여백 (네비게이션바 가림 방지) */}
      <div className="h-4" />
    </div>
  );
}
