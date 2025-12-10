import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calculator, CheckCircle2, Phone, MapPin, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AppPage } from "@/components/layout/AppPage";
import { estimates } from "@/services/api";
import { getEstimateData } from "@/data/estimateData";

export default function EstimatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [area, setArea] = useState("");
  const [type, setType] = useState("apartment");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ phone: "", location: "" });

  const handleCalculate = async () => {
    const pyeong = parseInt(area);
    if (!area || isNaN(pyeong)) {
      return toast({ title: "평수를 올바르게 입력해주세요", variant: "destructive" });
    }
    
    setLoading(true);
    
    await new Promise(r => setTimeout(r, 1200));
    
    const data = getEstimateData(pyeong);
    
    const minCost = pyeong * data.minPricePerPy * 10000;
    const maxCost = pyeong * data.maxPricePerPy * 10000;
    const avgCost = Math.round((minCost + maxCost) / 2);

    setResult({
      pyeong: pyeong,
      rangeInfo: data,
      total: avgCost,
      min: minCost,
      max: maxCost,
      details: data.details.map(d => ({
        ...d,
        cost: Math.round(avgCost * (d.percent / 100))
      }))
    });

    setLoading(false);
  };

  const handleSubmitRequest = async () => {
    if (!contactForm.phone || !contactForm.location) {
      return toast({ title: "연락처와 지역을 입력해주세요", variant: "destructive" });
    }
    try {
      await estimates.createRequest({
        project_type: type === 'apartment' ? '아파트' : '빌라/주택',
        budget_range: `${(result.min / 10000).toLocaleString()}만 ~ ${(result.max / 10000).toLocaleString()}만원`,
        location: contactForm.location,
        contact_phone: contactForm.phone,
        ai_summary: `${area}평 ${result.rangeInfo.range} AI 견적 (예상가: ${(result.total/10000).toLocaleString()}만원)`
      });
      toast({ title: "상담 신청 완료", description: "전문가가 곧 연락드립니다." });
      setIsModalOpen(false);
      navigate("/estimate-requests");
    } catch (e: any) {
      toast({ title: "오류", description: e.message, variant: "destructive" });
    }
  };

  return (
    <AppPage title="AI 견적 계산기" description="빅데이터 기반으로 우리 집 공사비를 예측합니다.">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              공사 정보 입력
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>주거 형태</Label>
              <div className="flex gap-4 mt-2">
                <Button 
                  variant={type === "apartment" ? "default" : "outline"} 
                  onClick={() => setType("apartment")}
                  className="flex-1"
                >
                  아파트
                </Button>
                <Button 
                  variant={type === "villa" ? "default" : "outline"} 
                  onClick={() => setType("villa")}
                  className="flex-1"
                >
                  빌라/주택
                </Button>
              </div>
            </div>
            <div>
              <Label>공급 면적 (평)</Label>
              <Input 
                type="number" 
                value={area} 
                onChange={e => setArea(e.target.value)} 
                placeholder="예: 32"
                className="mt-2 text-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">※ 공급면적(분양평수) 기준으로 입력해주세요.</p>
            </div>
            <Button onClick={handleCalculate} disabled={loading} className="w-full gap-2 text-lg h-12">
              <Calculator className="w-5 h-5" />
              {loading ? "빅데이터 분석 중..." : "무료 견적 확인하기"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
            
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6 text-center space-y-2">
                <Badge variant="secondary" className="mb-2">
                   {result.rangeInfo.range} 데이터 기준
                </Badge>
                <p className="text-muted-foreground">예상 인테리어 비용</p>
                <h3 className="text-4xl font-bold">
                  {(result.min / 10000).toLocaleString()} ~ {(result.max / 10000).toLocaleString()} <span className="text-xl font-normal text-muted-foreground">만원</span>
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                   "{result.rangeInfo.description}"
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">공정별 상세 예상 비용</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.details.map((item: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-bold">{item.name}</span>
                      <span className="font-medium">
                        약 {(item.cost / 10000).toLocaleString()}만원 ({item.percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full" 
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg flex gap-3 items-start border border-green-200 dark:border-green-900">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="text-sm text-green-800 dark:text-green-200">
                <p className="font-bold mb-1">정확한 견적이 필요하신가요?</p>
                <p>위 금액은 평균치이며, 현장 상황과 자재 등급에 따라 달라집니다. 전문가에게 무료 방문 견적을 받아보세요.</p>
              </div>
            </div>

            <Button size="lg" className="w-full text-lg h-14 shadow-lg" onClick={() => setIsModalOpen(true)}>
              전문가 상담 신청하기 (무료)
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>전문가 상담 신청</DialogTitle>
            <DialogDescription>
              연락처를 남겨주시면 지역 내 우수 파트너가 연락드립니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>연락처</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="010-1234-5678" 
                  className="pl-9"
                  value={contactForm.phone}
                  onChange={e => setContactForm({...contactForm, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>시공 지역</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="예: 서울 강남구 역삼동" 
                  className="pl-9"
                  value={contactForm.location}
                  onChange={e => setContactForm({...contactForm, location: e.target.value})}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded">
              선택하신 {area}평형 데이터가 전문가에게 함께 전달됩니다.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>취소</Button>
            <Button onClick={handleSubmitRequest}>신청 완료</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
