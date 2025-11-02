import { Link } from "react-router-dom";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowRight, Shield, FileCheck, Users } from "lucide-react";

const sampleData = [
  { id: 1, title: "화이트톤 리폼", img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80", desc: "밝고 심플한 공간 디자인" },
  { id: 2, title: "우드 포인트 거실", img: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80", desc: "따뜻한 감성의 원목 느낌" },
  { id: 3, title: "모던 주방 리모델링", img: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800&q=80", desc: "효율적 수납과 감각적 조명" },
  { id: 4, title: "미니멀 침실", img: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80", desc: "간결함 속의 편안함" },
  { id: 5, title: "북유럽 스타일 거실", img: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80", desc: "자연스러운 채광과 따뜻한 색감" },
  { id: 6, title: "럭셔리 욕실 개조", img: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80", desc: "호텔 같은 고급스러운 공간" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden mb-20">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-muted/30 via-background to-muted/20"></div>
        <div className="relative z-10 container mx-auto px-4 py-24 max-w-6xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              당신의 공간을 새롭게
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              전문가와 함께하는 안전한 인테리어 계약
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/contract/create">
                <Button size="lg" className="h-14 px-8 text-base rounded-full shadow-[var(--shadow-md)]">
                  계약 시작하기
                </Button>
              </Link>
              <Link to="/match">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full">
                  전문가 찾기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16 max-w-6xl">

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-4 mb-20">
          <div className="p-8 rounded-3xl bg-card border border-border hover:shadow-[var(--shadow-lg)] transition-all">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Shield className="w-10 h-10 text-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">안전한 에스크로</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              단계별 결제로 고객과 전문가 모두를 보호합니다
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-card border border-border hover:shadow-[var(--shadow-lg)] transition-all">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <FileCheck className="w-10 h-10 text-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">계약서 검토</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI 기반 위험 요소 분석으로 안전한 계약을 체결하세요
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-card border border-border hover:shadow-[var(--shadow-lg)] transition-all">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">검증된 전문가</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              신뢰할 수 있는 인테리어 전문가와 매칭됩니다
            </p>
          </div>
        </div>
        
        {/* Portfolio Section */}
        <h2 className="text-2xl font-bold text-foreground mb-6">오늘의 인테리어</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {sampleData.map(item => <Card key={item.id} {...item} />)}
        </div>

        {/* Partner CTA Section */}
        <div className="rounded-3xl bg-secondary p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              인테리어 전문가이신가요?
            </h2>
            <p className="text-base text-muted-foreground mb-8 leading-relaxed">
              새로고침 파트너가 되어 더 많은 고객을 만나고,<br />안전한 결제 시스템으로 비즈니스를 성장시키세요
            </p>
            <Link to="/partner/apply">
              <Button size="lg" className="h-14 px-8 text-base rounded-full shadow-[var(--shadow-md)]">
                파트너 신청하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
