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
    <div className="min-h-[calc(100vh-180px)] bg-background p-3 sm:p-4">
      <div className="container mx-auto max-w-2xl py-6 sm:py-8 md:py-12">
        <div className="mb-6 sm:mb-8 md:mb-10 text-center px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3">사기업체 조회</h1>
          <p className="text-sm sm:text-base text-muted-foreground">의심되는 업체 정보를 검색하세요</p>
        </div>
        
        <div className="rounded-2xl sm:rounded-3xl bg-card border border-border p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm font-medium">업체명 또는 담당자명</Label>
              <Input
                id="name"
                placeholder="예: 홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 sm:h-11 md:h-12 rounded-xl sm:rounded-2xl text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs sm:text-sm font-medium">전화번호</Label>
              <Input
                id="phone"
                placeholder="예: 010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 sm:h-11 md:h-12 rounded-xl sm:rounded-2xl text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license" className="text-xs sm:text-sm font-medium">사업자등록번호</Label>
              <Input
                id="license"
                placeholder="예: 123-45-67890"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="h-10 sm:h-11 md:h-12 rounded-xl sm:rounded-2xl text-sm sm:text-base"
              />
            </div>
            <Button onClick={handleSearch} className="w-full h-11 sm:h-12 md:h-14 rounded-full text-sm sm:text-base shadow-[var(--shadow-md)]">
              조회하기
            </Button>
          </div>
        </div>

        {searched && (
          <>
            {results.length === 0 ? (
              <div className="rounded-3xl bg-card border border-border p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <div className="text-3xl text-green-600">✓</div>
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">조회 결과가 없습니다</p>
                <p className="text-sm text-muted-foreground">사기 신고 내역이 없는 업체입니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <h2 className="text-lg font-semibold text-foreground">주의 필요 ({results.length}건)</h2>
                </div>
                {results.map((item) => (
                  <div key={item.id} className="rounded-3xl bg-card border border-destructive/30 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-destructive mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.phone}</p>
                      </div>
                      <Badge variant="destructive" className="rounded-full px-3 py-1">
                        신고 {item.cases}건
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold text-foreground">면허:</span> <span className="text-muted-foreground">{item.license}</span></p>
                      <p><span className="font-semibold text-foreground">주의사항:</span> <span className="text-muted-foreground">{item.note}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
