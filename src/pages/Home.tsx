import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users } from "lucide-react";

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

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const startContract = () => {
    if (!authed) {
      toast({
        title: "로그인이 필요합니다",
        description: "계약서를 작성하려면 먼저 로그인하세요.",
      });
      navigate("/login");
      return;
    }
    navigate("/contract/create");
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-gray-900">
              당신의 공간을
              <br />
              <span className="text-primary">새롭게</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              전문가와 함께하는 안전한 인테리어 계약
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 transition"
                onClick={startContract}
              >
                계약 시작하기
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/match")}
              >
                전문가 찾기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 왜 새로고침인가요? */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6">왜 새로고침인가요?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {reasons.map((r) => (
            <div key={r.title} className="border rounded-2xl p-6 hover:shadow-lg transition">
              <h3 className="font-semibold mb-2">{r.title}</h3>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 오늘의 인테리어 */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">오늘의 인테리어</h2>
          <div className="grid md:grid-cols-3 gap-6">
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

      {/* 전문가 CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-3xl border-2 border-primary/20 p-10 md:p-16 text-center bg-gradient-to-br from-primary/5 to-primary/10">
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
    </div>
  );
}
