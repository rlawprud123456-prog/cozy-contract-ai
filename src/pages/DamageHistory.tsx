import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DamageReport {
  id: string;
  business_name: string;
  phone: string | null;
  business_license: string | null;
  amount: number | null;
  description: string | null;
  created_at: string;
}

export default function DamageHistory() {
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<DamageReport[]>([]);
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchLicense, setSearchLicense] = useState("");
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("damage_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "오류",
        description: "피해이력을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    setReports(data || []);
  };

  const handleSearch = () => {
    const filtered = reports.filter((report) => {
      const matchName = !searchName || report.business_name.toLowerCase().includes(searchName.toLowerCase());
      const matchPhone = !searchPhone || (report.phone && report.phone.includes(searchPhone));
      const matchLicense = !searchLicense || (report.business_license && report.business_license.includes(searchLicense));
      
      return matchName && matchPhone && matchLicense;
    });

    setFilteredReports(filtered);
    setSearched(true);
  };

  const displayReports = searched ? filteredReports : reports;

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background p-3 sm:p-4">
      <div className="container mx-auto max-w-4xl py-6 sm:py-8 md:py-12">
        <div className="mb-6 sm:mb-8 md:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3">피해이력 조회</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">등록된 피해 신고 내역을 확인하세요</p>
        </div>

        <Card className="rounded-3xl border border-border p-8 mb-8">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="searchName" className="text-sm font-medium">업체명</Label>
              <Input
                id="searchName"
                placeholder="업체명 검색"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="h-12 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="searchPhone" className="text-sm font-medium">전화번호</Label>
              <Input
                id="searchPhone"
                placeholder="전화번호 검색"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="h-12 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="searchLicense" className="text-sm font-medium">사업자등록번호</Label>
              <Input
                id="searchLicense"
                placeholder="사업자등록번호 검색"
                value={searchLicense}
                onChange={(e) => setSearchLicense(e.target.value)}
                className="h-12 rounded-2xl"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              className="w-full h-14 rounded-full text-base"
            >
              <Search className="w-5 h-5 mr-2" />
              검색
            </Button>
          </div>
        </Card>

        {searched && displayReports.length === 0 ? (
          <div className="rounded-3xl bg-card border border-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <div className="text-3xl text-green-600">✓</div>
            </div>
            <p className="text-lg font-semibold text-foreground mb-2">조회 결과가 없습니다</p>
            <p className="text-sm text-muted-foreground">해당 조건의 피해 신고가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayReports.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h2 className="text-lg font-semibold text-foreground">
                  피해 신고 내역 ({displayReports.length}건)
                </h2>
              </div>
            )}
            {displayReports.map((report) => (
              <Card key={report.id} className="rounded-3xl border border-destructive/30 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-destructive mb-1">
                      {report.business_name}
                    </h3>
                    {report.phone && (
                      <p className="text-sm text-muted-foreground">전화: {report.phone}</p>
                    )}
                  </div>
                  {report.amount && (
                    <Badge variant="destructive" className="rounded-full px-3 py-1">
                      {report.amount.toLocaleString()}원
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  {report.business_license && (
                    <p>
                      <span className="font-semibold text-foreground">사업자등록번호:</span>{" "}
                      <span className="text-muted-foreground">{report.business_license}</span>
                    </p>
                  )}
                  {report.description && (
                    <p>
                      <span className="font-semibold text-foreground">피해 내용:</span>{" "}
                      <span className="text-muted-foreground">{report.description}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    신고일: {new Date(report.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
