import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { partners } from "@/services/api";
import { Star, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Match() {
  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState("4.0");
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    const { items } = await partners.match({ city, minRating: parseFloat(minRating) });
    setResults(items);
    if (items.length === 0) {
      toast({ title: "검색 결과 없음", description: "조건에 맞는 전문가가 없습니다" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-3 sm:p-4">
      <div className="container mx-auto max-w-4xl py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">전문가 매칭</h1>
        
        <Card className="shadow-[var(--shadow-card)] mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">조건 입력</CardTitle>
            <CardDescription className="text-sm">원하는 지역과 평점을 선택하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm">지역</Label>
              <Input
                id="city"
                placeholder="예: 서울, 수원, 인천"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating" className="text-sm">최소 평점</Label>
              <Select value={minRating} onValueChange={setMinRating}>
                <SelectTrigger id="rating" className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4.0">4.0 이상</SelectItem>
                  <SelectItem value="4.3">4.3 이상</SelectItem>
                  <SelectItem value="4.5">4.5 이상</SelectItem>
                  <SelectItem value="4.7">4.7 이상</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch} className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base">
              전문가 찾기
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">검색 결과 ({results.length}개)</h2>
            {results.map((partner) => (
              <Card key={partner.id} className="shadow-[var(--shadow-card)]">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <CardTitle className="text-base sm:text-lg">{partner.name}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">{partner.city} · {partner.category}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                      <span className="font-semibold text-sm sm:text-base">{partner.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{partner.phone}</span>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-sm">상담 신청</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
