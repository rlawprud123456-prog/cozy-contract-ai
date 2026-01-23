import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Building2, 
  Calculator,
  HardHat,
  FileCheck2,
  SearchCheck,
  History,
  Award,
  ArrowRight
} from "lucide-react";
import Chatbot from "@/components/Chatbot";

const styles = [
  { 
    id: 1, 
    title: "미니멀 화이트 홈", 
    desc: "군더더기 없는 깔끔한 공간 디자인", 
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    q: "white" 
  },
  { 
    id: 2, 
    title: "내추럴 우드 & 플랜테리어", 
    desc: "따뜻한 감성의 원목과 식물의 조화", 
    img: "https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&q=80",
    q: "wood" 
  },
  { 
    id: 3, 
    title: "프리미엄 키친 & 다이닝", 
    desc: "호텔 같은 고급스러운 주방 공간", 
    img: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80",
    q: "modern" 
  },
];

const reasons = [
  { 
    icon: <ShieldCheck className="w-7 h-7" />,
    title: "안전한 에스크로 결제", 
    desc: "공사 단계별로 대금을 예치하고, 고객 승인 시에만 지급하여 먹튀를 원천 차단합니다." 
  },
  { 
    icon: <SearchCheck className="w-7 h-7" />,
    title: "AI 계약서 리스크 분석", 
    desc: "불공정 조항이나 독소 조항을 AI가 3초 만에 찾아내어 안전한 계약을 돕습니다." 
  },
  { 
    icon: <History className="w-7 h-7" />,
    title: "원스톱 평판 조회", 
    desc: "시공사의 과거 피해 사례, 법적 분쟁 이력, 실제 고객 리뷰를 한눈에 확인하세요." 
  },
];

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [featuredPartners, setFeaturedPartners] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setAuthed(!!session));
    fetchFeaturedPartners();
  }, []);

  const fetchFeaturedPartners = async () => {
    const { data } = await supabase.from("partners").select("*").eq("status", "approved").limit(4);
    
    if (data && data.length > 0) {
      setFeaturedPartners(data);
    } else {
      setFeaturedPartners([
        { 
          id: 'demo1', business_name: '아텔리에 서울', category: '프리미엄 아파트', description: '강남권 하이엔드 주거공간 전문', 
          portfolio_images: ['https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=600&q=80']
        },
        { 
          id: 'demo2', business_name: '스튜디오 모노', category: '상업/오피스', description: '트렌디한 카페 및 쇼룸 디자인', 
          portfolio_images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80']
        },
        { 
          id: 'demo3', business_name: '더 빌드', category: '단독주택/빌라', description: '기초부터 튼튼한 리모델링', 
          portfolio_images: ['https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&q=80']
        },
        { 
          id: 'demo4', business_name: '공간작업소', category: '부분시공/스타일링', description: '합리적인 공간 변화 솔루션', 
          portfolio_images: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80']
        },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* 1. 히어로 섹션 */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">

        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80" 
            alt="Modern Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <div className="max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 mr-1.5" /> 안전 거래 보장
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              불안한 인테리어 계약,<br />
              바로고침으로 끝내세요.
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
              투명한 견적 비교부터 에스크로 안전 결제까지.<br />
              검증된 전문가와 함께 당신의 공간을 안심하고 완성하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-slate-900 hover:bg-gray-100 font-bold text-base px-8 py-6 h-auto shadow-lg"
                onClick={() => navigate(authed ? "/contract-create" : "/login")}
              >
                <FileCheck2 className="mr-2 h-5 w-5" /> 무료 계약서 작성
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/50 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm font-bold text-base px-8 py-6 h-auto"
                onClick={() => navigate("/match")}
              >
                <HardHat className="mr-2 h-5 w-5" /> 검증된 전문가 찾기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 통계 섹션 */}
      <section className="py-12 bg-slate-50 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">누적 견적 요청</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-800">1,240+</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <HardHat className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">검증된 파트너</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-800">58팀</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">안전 결제 보호율</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-800">100%</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 차별점 */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-3">Why 바로고침?</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">믿을 수 있는 이유</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {reasons.map((r, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mb-5 shadow-md">
                  {r.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{r.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 이달의 전문가 */}
      <section className="py-20 bg-slate-50">
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
                  <div className="aspect-[4/3] relative bg-slate-200 overflow-hidden">
                    <img 
                      src={partner.portfolio_images?.[0] || '/placeholder.svg'} 
                      alt={partner.business_name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-blue-600/90 text-white text-xs backdrop-blur-sm"><Award className="w-3 h-3 mr-1" /> 인증업체</Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-1 pt-4">
                    <CardDescription className="text-xs">{partner.category}</CardDescription>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
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
      <section className="py-20 bg-white">
        <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center">취향저격 스타일 찾기</h3>
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {styles.map((style) => (
            <Link key={style.id} to={`/partners?style=${style.q}`} className="group relative aspect-[16/10] rounded-2xl overflow-hidden shadow-lg">
              <img src={style.img} alt={style.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h4 className="text-xl md:text-2xl font-bold mb-1">
                  {style.title}
                </h4>
                <p className="text-sm text-white/80 group-hover:text-white transition-colors">
                  {style.desc} <ArrowRight className="inline w-4 h-4 ml-1" />
                </p>
              </div>
            </Link>
          ))}
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

      <Chatbot />
    </div>
  );
}
