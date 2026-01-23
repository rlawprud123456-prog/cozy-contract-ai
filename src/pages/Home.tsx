import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ShieldCheck, 
  Building2, 
  Calculator, 
  HardHat, 
  FileCheck2, 
  SearchCheck, 
  History, 
  Award,
  ArrowRight,
  Handshake,
  Search,
  AlertTriangle
} from "lucide-react";
import Chatbot from "@/components/Chatbot";

const BASE_STATS = { ESTIMATES: 0, PARTNERS: 0 };

const styles = [
  { id: 1, title: "미니멀 화이트 홈", desc: "군더더기 없는 깔끔한 공간 디자인", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", q: "white" },
  { id: 2, title: "내추럴 우드 & 플랜테리어", desc: "따뜻한 감성의 원목과 식물의 조화", img: "https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&q=80", q: "wood" },
  { id: 3, title: "프리미엄 키친 & 다이닝", desc: "호텔 같은 고급스러운 주방 공간", img: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80", q: "modern" },
];

const reasons = [
  { icon: <ShieldCheck className="w-8 h-8" />, title: "안전한 에스크로 결제", desc: "공사 단계별로 대금을 예치하고, 고객 승인 시에만 지급하여 먹튀를 원천 차단합니다." },
  { icon: <FileCheck2 className="w-8 h-8" />, title: "AI 계약서 리스크 분석", desc: "불공정 조항이나 독소 조항을 AI가 3초 만에 찾아내어 안전한 계약을 돕습니다." },
  { icon: <SearchCheck className="w-8 h-8" />, title: "원스톱 평판 조회", desc: "시공사의 과거 피해 사례, 법적 분쟁 이력, 실제 고객 리뷰를 한눈에 확인하세요." },
];

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [featuredPartners, setFeaturedPartners] = useState<any[]>([]);
  const [stats, setStats] = useState({ estimates: 0, partners: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setAuthed(!!session));
    fetchFeaturedPartners();
    fetchRealtimeStats();
  }, []);

  const fetchRealtimeStats = async () => {
    try {
      const { count: estimateCount } = await supabase.from('estimate_requests').select('*', { count: 'exact', head: true });
      const { count: partnerCount } = await supabase.from('partners').select('*', { count: 'exact', head: true }).eq('status', 'approved');
      setStats({ estimates: estimateCount || 0, partners: partnerCount || 0 });
    } catch (error) { console.error(error); }
  };

  const fetchFeaturedPartners = async () => {
    const { data } = await supabase.from("partners").select("*").eq("status", "approved").limit(4);
    if (data && data.length > 0) { setFeaturedPartners(data); } 
    else {
      setFeaturedPartners([
        { id: 'demo1', business_name: '아텔리에 서울', category: '프리미엄 아파트', description: '강남권 하이엔드 주거공간 전문', portfolio_images: ['https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=600&q=80'] },
        { id: 'demo2', business_name: '스튜디오 모노', category: '상업/오피스', description: '트렌디한 카페 및 쇼룸 디자인', portfolio_images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80'] },
        { id: 'demo3', business_name: '더 빌드', category: '단독주택/빌라', description: '기초부터 튼튼한 리모델링', portfolio_images: ['https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&q=80'] },
        { id: 'demo4', business_name: '공간작업소', category: '부분시공/스타일링', description: '합리적인 공간 변화 솔루션', portfolio_images: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80'] },
      ]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/damage-history?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* 1. 히어로 섹션 */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80" 
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" /> 
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 mr-2" /> 안전 거래 보장
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              불안한 인테리어 계약,<br />
              바로고침으로 끝내세요.
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto">
              투명한 견적 비교부터 에스크로 안전 결제까지.<br />
              검증된 전문가와 함께 당신의 공간을 안심하고 완성하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 rounded-xl shadow-lg" onClick={() => navigate(authed ? "/contract-create" : "/login")}>
                <FileCheck2 className="w-5 h-5 mr-2" /> 무료 계약서 작성
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-white/50 bg-white/10 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm" onClick={() => navigate("/match")}>
                <Search className="w-5 h-5 mr-2" /> 검증된 전문가 찾기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 피해 사례 안심 조회 */}
      <section className="py-16 bg-gradient-to-b from-amber-50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 border-amber-500 text-amber-700 bg-amber-100">
              <AlertTriangle className="w-4 h-4 mr-1" /> 사기 피해 방지
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">혹시 내 시공업체도?</h2>
            <p className="text-muted-foreground mb-6">계약 전, 전화번호 하나로 피해 이력을 조회해보세요.</p>
            
            <form onSubmit={handleSearch}>
              <div className="flex gap-2 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="업체명 또는 전화번호 입력"
                    className="h-14 pl-12 rounded-xl text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="h-14 px-6 rounded-xl font-bold">
                  조회하기
                </Button>
              </div>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              * 최근 5년간의 피해 신고 접수 이력을 기반으로 조회됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* 3. 통계 섹션 */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto text-center">
            <div className="p-4">
              <p className="text-2xl md:text-4xl font-extrabold text-primary">
                {(BASE_STATS.ESTIMATES + stats.estimates).toLocaleString()}건
              </p>
              <p className="text-sm text-muted-foreground mt-1">누적 견적 요청</p>
            </div>
            <div className="p-4">
              <p className="text-2xl md:text-4xl font-extrabold text-primary">
                {(BASE_STATS.PARTNERS + stats.partners).toLocaleString()}팀
              </p>
              <p className="text-sm text-muted-foreground mt-1">검증된 파트너</p>
            </div>
            <div className="p-4">
              <p className="text-2xl md:text-4xl font-extrabold text-primary">100%</p>
              <p className="text-sm text-muted-foreground mt-1">안전 결제 보호율</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why 바로고침 */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Why 바로고침?</h2>
            <p className="text-muted-foreground mt-2">믿을 수 있는 이유</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {reasons.map((r, idx) => (
              <div key={idx} className="text-center p-6 rounded-2xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  {r.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{r.title}</h3>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 이달의 전문가 */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <Badge className="mb-2 bg-amber-500 text-white">이달의 추천</Badge>
              <h2 className="text-3xl font-bold">검증된 시공 파트너</h2>
            </div>
            <Button variant="ghost" onClick={() => navigate("/partners")}>
              전체보기 <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPartners.map((partner) => (
              <Link key={partner.id} to={`/partners/detail/${partner.id}`}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border-none shadow-md">
                  <div className="aspect-[4/3] relative bg-muted overflow-hidden">
                    <img 
                      src={partner.portfolio_images?.[0] || '/placeholder.svg'} 
                      alt={partner.business_name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-primary/90 text-primary-foreground text-xs backdrop-blur-sm"><Award className="w-3 h-3 mr-1" /> 인증업체</Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-1 pt-4">
                    <CardDescription className="text-xs">{partner.category}</CardDescription>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {partner.business_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {partner.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 스타일별 추천 */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">취향저격 스타일 찾기</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {styles.map((style) => (
              <Link key={style.id} to={`/partners?style=${style.q}`} className="group block rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img src={style.img} alt={style.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-4 bg-card">
                  <h3 className="font-bold text-foreground">{style.title}</h3>
                  <p className="text-sm text-muted-foreground">{style.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. 파트너 신청 CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div 
            className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center text-white"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-slate-900/80" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-6 border border-white/20">
                <Building2 className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                실력 있는 전문가를 찾습니다.
              </h2>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                바로고침의 검증된 파트너가 되어, <br />
                신뢰받는 브랜드로 함께 성장하세요.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate("/partner/apply")}
                className="bg-white text-slate-900 hover:bg-gray-100 font-bold px-10 py-7 h-auto text-lg shadow-lg border-none transition-transform hover:scale-105"
              >
                파트너 신청하고 혜택받기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. 협력사 */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Official Partners</p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Handshake className="w-6 h-6" />
                <span className="font-semibold">(주)명광</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Chatbot />
    </div>
  );
}
