import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calculator, CheckCircle2, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AppPage } from "@/components/layout/AppPage";
import { estimates } from "@/services/api";

export default function EstimatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // 입력 상태
  const [area, setArea] = useState("");
  const [type, setType] = useState("apartment");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 상담 신청 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    phone: "",
    location: "",
    budget: ""
  });

  const handleCalculate = async () => {
    if (!area) return toast({ title: "평수를 입력해주세요", variant: "destructive" });
    setLoading(true);
    
    // AI 분석 시뮬레이션
    await new Promise(r => setTimeout(r, 1500));
    
    setResult({
      total: parseInt(area) * 1500000,
      min: parseInt(area) * 1200000,
      max: parseInt(area) * 1800000,
      details: [
        { name: "철거/설비", percent: 15 },
        { name: "목공사", percent: 20 },
        { name: "타일/욕실", percent: 15 },
        { name: "도배/바닥", percent: 15 },
        { name: "가구/싱크대", percent: 25 },
        { name: "기타/조명", percent: 10 },
      ]
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
        ai_summary: `${area}평 ${type} 리모델링 예상 견적`
      });

      toast({
        title: "상담 신청 완료",
        description: "검증된 전문가가 곧 연락드릴 예정입니다.",
      });
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
            <CardTitle className="text-lg">공사 정보 입력</CardTitle>
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
                className="mt-2"
              />
            </div>
            <Button onClick={handleCalculate} disabled={loading} className="w-full gap-2">
              <Calculator className="w-4 h-4" />
              {loading ? "분석 중..." : "견적 확인하기"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
            <Card className="border-accent/50 bg-accent/5">
              <CardContent className="pt-6 text-center space-y-2">
                <p className="text-muted-foreground">예상 견적 범위</p>
                <h3 className="text-3xl font-bold text-accent">
                  {(result.min / 10000).toLocaleString()} ~ {(result.max / 10000).toLocaleString()} <span className="text-lg text-foreground font-normal">만원</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  * 자재 등급과 현장 상황에 따라 달라질 수 있습니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">공정별 예상 비용</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.details.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">
                      약 {Math.round(result.total * (item.percent / 100) / 10000).toLocaleString()}만원 ({item.percent}%)
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start dark:bg-blue-950/30">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-bold mb-1">이 견적으로 상담 받아보시겠어요?</p>
                <p>검증된 파트너 3곳에서 무료로 상세 견적과 방문 상담을 도와드립니다.</p>
              </div>
            </div>

            <Button size="lg" className="w-full text-lg h-12" onClick={() => setIsModalOpen(true)}>
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
            <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded">
              AI 분석 결과({area}평 {type})가 함께 전달되어 더 정확한 상담이 가능합니다.
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
