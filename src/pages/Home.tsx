import Card from "@/components/Card";

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
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            당신의 공간을 새롭게
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            전문가와 함께하는 안전한 인테리어 계약, 새로고침과 시작하세요
          </p>
        </div>
        
        <h2 className="text-2xl font-bold text-primary mb-6">오늘의 인테리어</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleData.map(item => <Card key={item.id} {...item} />)}
        </div>
      </div>
    </div>
  );
}
