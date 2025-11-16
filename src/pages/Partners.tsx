import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const categories = [
  { id: 1, name: "화이트톤", desc: "깔끔하고 밝은 화이트 인테리어", icon: "🤍" },
  { id: 2, name: "우드 포인트", desc: "따뜻한 원목 감성", icon: "🪵" },
  { id: 3, name: "모던 주방", desc: "세련된 주방 리모델링", icon: "🍳" },
  { id: 4, name: "라이트 그레이", desc: "모던한 그레이 톤", icon: "⬜" },
  { id: 5, name: "내추럴 베이지", desc: "자연스러운 베이지 컬러", icon: "🟫" },
  { id: 6, name: "산뜻한 현관", desc: "첫인상을 결정하는 현관", icon: "🚪" },
];

export default function Partners() {
  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-3 sm:p-4">
      <div className="container mx-auto max-w-6xl py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">파트너 찾기</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">카테고리별 인테리어 전문가를 찾아보세요</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/partners/${encodeURIComponent(cat.name)}`}>
              <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all cursor-pointer h-full">
                <CardHeader className="p-4 sm:p-6">
                  <div className="text-3xl sm:text-4xl mb-2">{cat.icon}</div>
                  <CardTitle className="text-base sm:text-lg">{cat.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{cat.desc}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <p className="text-xs sm:text-sm text-accent font-medium">전문가 보기 →</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
