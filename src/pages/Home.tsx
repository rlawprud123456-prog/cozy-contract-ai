import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, ShieldCheck, UserSearch, FileText, 
  Wand2, Home as HomeIcon, AlertTriangle, Menu, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

// 퀵 메뉴 데이터
const QUICK_MENUS = [
  { icon: UserSearch, label: "전문가 찾기", path: "/match", color: "bg-blue-100 text-blue-600" },
  { icon: ShieldCheck, label: "안전 에스크로", path: "/escrow", color: "bg-green-100 text-green-600" },
  { icon: AlertTriangle, label: "사기꾼 조회", path: "/scammer-search", color: "bg-red-100 text-red-600" },
  { icon: Wand2, label: "AI 인테리어", path: "/ai-interior", color: "bg-purple-100 text-purple-600" },
  { icon: FileText, label: "증빙 패키지", path: "/evidence-package", color: "bg-orange-100 text-orange-600" },
  { icon: HomeIcon, label: "시공 사례", path: "/history", color: "bg-gray-100 text-gray-600" },
  { icon: Bell, label: "커뮤니티", path: "/community/diy-tips", color: "bg-yellow-100 text-yellow-600" },
  { icon: Menu, label: "전체 메뉴", path: "/profile", color: "bg-slate-100 text-slate-600" },
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
    <div className="pb-20 bg-white min-h-screen">
      {/* 1. 상단 검색바 & 알림 */}
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

      {/* 2. 메인 배너 */}
      <div className="relative w-full aspect-[21/9] bg-slate-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80" 
          alt="Banner" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <Badge className="w-fit mb-2 bg-accent text-white border-none">안전 거래 캠페인</Badge>
          <h2 className="text-2xl font-bold text-white leading-tight">
            인테리어 먹튀 걱정 끝!<br />
            <span className="text-accent">에스크로 안전결제</span> 시작하기
          </h2>
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

      <div className="h-2 bg-gray-50" />

      {/* 4. 인기 전문가 */}
      <section className="py-8 pl-4">
        <div className="flex justify-between items-center pr-4 mb-4">
          <h3 className="font-bold text-lg text-slate-900">우리 동네 인기 전문가 🔥</h3>
          <Link to="/match" className="text-xs text-gray-500 hover:text-gray-900">전체보기</Link>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 pr-4 scrollbar-hide">
          {featuredPartners.length > 0 ? (
            featuredPartners.map((partner) => (
              <Link key={partner.id} to={`/partners`} className="shrink-0 w-[160px]">
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
                  <Badge className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm border-none text-[10px] h-5">
                    {partner.category}
                  </Badge>
                </div>
                <h4 className="font-bold text-sm truncate">{partner.business_name}</h4>
                <p className="text-xs text-gray-500 truncate">{partner.description || "인테리어 전문"}</p>
              </Link>
            ))
          ) : (
            [1, 2, 3, 4, 5].map((_, i) => (
              <Link key={i} to={`/partners`} className="shrink-0 w-[160px]">
                <div className="rounded-lg overflow-hidden aspect-[4/3] mb-2 relative">
                  <img 
                    src={`https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=400`} 
                    alt="Partner" 
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm border-none text-[10px] h-5">평점 4.9</Badge>
                </div>
                <h4 className="font-bold text-sm truncate">디자인 스튜디오 {i+1}</h4>
                <p className="text-xs text-gray-500 truncate">서울 강남구 • 아파트 리모델링</p>
              </Link>
            ))
          )}
        </div>
      </section>

      <div className="h-2 bg-gray-50" /> 

      {/* 5. 실시간 피해 주의 */}
      <section className="py-8 pl-4">
        <div className="flex justify-between items-center pr-4 mb-4">
          <h3 className="font-bold text-lg text-slate-900">실시간 사기 피해 주의 🚨</h3>
          <Link to="/scammer-search" className="text-xs text-gray-500 hover:text-gray-900">더보기</Link>
        </div>

        <div className="flex overflow-x-auto gap-3 pb-4 pr-4 scrollbar-hide">
          {[1, 2, 3].map((_, i) => (
            <Card key={i} className="shrink-0 w-[240px] border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-bold text-red-500">주의 요망</span>
                </div>
                <p className="font-bold text-sm mb-1">연락 두절 및 공사 중단</p>
                <p className="text-xs text-gray-500">010-****-{1234 + i} (김*수)</p>
                <p className="text-[10px] text-gray-400 mt-2">2025.12.07 신고 접수</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="h-10" />
    </div>
  );
}
