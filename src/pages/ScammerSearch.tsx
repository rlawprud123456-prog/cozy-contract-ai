import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { scammers } from "@/services/api";
import { AlertTriangle } from "lucide-react";

export default function ScammerSearch() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [license, setLicense] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const { items } = await scammers.search({ name, phone, license });
    setResults(items);
    setSearched(true);
  };

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
          <h1 className="text-3xl font-bold text-primary">사기업체 조회</h1>
        </div>
        <p className="text-muted-foreground mb-8">의심되는 업체 정보를 검색하세요</p>
        
        <Card className="shadow-[var(--shadow-card)] mb-6">
          <CardHeader>
            <CardTitle>검색 조건</CardTitle>
            <CardDescription>이름, 전화번호, 면허번호로 검색 가능합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">업체명 또는 담당자명</Label>
              <Input
                id="name"
                placeholder="예: 홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                placeholder="예: 010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">사업자등록번호</Label>
              <Input
                id="license"
                placeholder="예: 123-45-67890"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch} className="w-full bg-primary hover:bg-primary/90">
              조회하기
            </Button>
          </CardContent>
        </Card>

        {searched && (
          <>
            {results.length === 0 ? (
              <Card className="shadow-[var(--shadow-card)] border-green-500/50">
                <CardContent className="py-12 text-center">
                  <div className="text-green-500 mb-2">✓</div>
                  <p className="font-semibold text-green-700 dark:text-green-400">조회 결과가 없습니다</p>
                  <p className="text-sm text-muted-foreground mt-2">사기 신고 내역이 없는 업체입니다</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">⚠️ 주의 필요 ({results.length}건)</h2>
                </div>
                {results.map((item) => (
                  <Card key={item.id} className="shadow-[var(--shadow-card)] border-destructive/50">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-destructive">{item.name}</CardTitle>
                          <CardDescription>{item.phone}</CardDescription>
                        </div>
                        <Badge variant="destructive">신고 {item.cases}건</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-semibold">면허:</span> {item.license}</p>
                        <p className="text-sm"><span className="font-semibold">주의사항:</span> {item.note}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
