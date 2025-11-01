import { Link } from "react-router-dom";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Users, Briefcase, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            당신의 공간을 새롭게
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            전문가와 함께하는 안전한 인테리어 계약, 새로고침과 시작하세요
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contract/create">
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                <FileText className="w-5 h-5 mr-2" />
                계약 시작하기
              </Button>
            </Link>
            <Link to="/match">
              <Button size="lg" variant="outline">
                <Users className="w-5 h-5 mr-2" />
                전문가 찾기
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-lg bg-card border border-border shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow">
            <Shield className="w-10 h-10 text-accent mb-3" />
            <h3 className="text-xl font-bold text-foreground mb-2">안전한 에스크로</h3>
            <p className="text-muted-foreground">
              단계별 결제로 고객과 전문가 모두를 보호합니다
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow">
            <FileText className="w-10 h-10 text-accent mb-3" />
            <h3 className="text-xl font-bold text-foreground mb-2">계약서 검토</h3>
            <p className="text-muted-foreground">
              AI 기반 위험 요소 분석으로 안전한 계약을 체결하세요
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow">
            <Users className="w-10 h-10 text-accent mb-3" />
            <h3 className="text-xl font-bold text-foreground mb-2">검증된 전문가</h3>
            <p className="text-muted-foreground">
              신뢰할 수 있는 인테리어 전문가와 매칭됩니다
            </p>
          </div>
        </div>
        
        {/* Portfolio Section */}
        <h2 className="text-2xl font-bold text-primary mb-6">오늘의 인테리어</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {sampleData.map(item => <Card key={item.id} {...item} />)}
        </div>

        {/* Partner CTA Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/10 via-accent/5 to-primary/10 border border-accent/20 p-8 md:p-12">
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              인테리어 전문가이신가요?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              새로고침 파트너가 되어 더 많은 고객을 만나고, 안전한 결제 시스템으로 비즈니스를 성장시키세요
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5 text-accent" />
                <span>에스크로 결제 보호</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Users className="w-5 h-5 text-accent" />
                <span>검증된 고객 매칭</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <FileText className="w-5 h-5 text-accent" />
                <span>계약서 관리 지원</span>
              </div>
            </div>
            <Link to="/partner/apply">
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                파트너 신청하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
