import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calculator, CheckCircle2, Phone, MapPin, 
  BarChart3, ArrowLeft, Building2, Home, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { estimates } from "@/services/api";
import { getEstimateData } from "@/data/estimateData";
import Chatbot from "@/components/Chatbot";

export default function EstimatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [area, setArea] = useState("");
  const [type, setType] = useState<"apartment" | "villa">("apartment");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ phone: "", location: "" });

  // 숫자 카운팅 애니메이션 효과
  const [displayTotal, setDisplayTotal] = useState(0);

  useEffect(() => {
    if (result && result.total) {
      let start = 0;
      const end = result.total / 10000;
      const duration = 1000;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        
        setDisplayTotal(Math.floor(start + (end - start) * ease));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [result]);

  const handleCalculate = async () => {
    const pyeong = parseInt(area);
    if (!area || isNaN(pyeong)) {
      return toast({ title: "평수를 입력해주세요", description: "숫자만 입력 가능합니다.", variant: "destructive" });
    }
    
    setLoading(true);
    setResult(null); // 결과 초기화
    
    // 분석 시뮬레이션 (1.5초)
    await new Promise(r => setTimeout(r, 1500));
    
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
      return toast({ title: "정보 누락", description: "연락처와 지역을 모두 입력해주세요.", variant: "destructive" });
    }
    try {
      await estimates.createRequest({
        project_type: type === 'apartment' ? '아파트' : '빌라/주택',
        budget_range: `${(result.min / 10000).toLocaleString()}만 ~ ${(result.max / 10000).toLocaleString()}만원`,
        location: contactForm.location,
        contact_phone: contactForm.phone,
        ai_summary: `${area}평 ${result.rangeInfo.range} AI 견적 (예상가: ${(result.total/10000).toLocaleString()}만원)`
      });
      toast({ title: "신청 완료", description: "지역 전문 파트너가 곧 연락드립니다." });
      setIsModalOpen(false);
      navigate("/estimate-requests");
    } catch (e: any) {
      toast({ title: "오류", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-32">

      {/* 헤더 */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">AI 예상 견적</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        
        {/* 1. 입력 섹션 */}
        <div className="space-y-6">

          <div className="text-center pt-4">
            <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              <BarChart3 className="w-3.5 h-3.5 mr-1" />
              빅데이터 분석
            </Badge>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1 leading-tight">
              우리 집 인테리어,<br/>
              얼마나 들까요?
            </h2>
            <p className="text-sm text-gray-500">30초 만에 예상 견적을 뽑아보세요.</p>
          </div>

          <Card className="border-0 shadow-lg bg-white rounded-3xl">
            <CardContent className="p-6 space-y-6">
              {/* 주거 형태 선택 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("apartment")}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    type === "apartment" 
                      ? "border-blue-600 bg-blue-50 text-blue-700" 
                      : "border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  <Building2 className="w-7 h-7" />
                  <span className="text-sm font-medium">아파트</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType("villa")}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    type === "villa" 
                      ? "border-blue-600 bg-blue-50 text-blue-700" 
                      : "border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  <Home className="w-7 h-7" />
                  <span className="text-sm font-medium">빌라/주택</span>
                </button>
              </div>

              {/* 평수 입력 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">공급 면적 (평)</Label>
                <div className="relative">
                  <Input 
                    type="number"
                    value={area} 
                    onChange={(e) => setArea(e.target.value)} 
                    placeholder="예: 34"
                    className="h-16 text-2xl font-bold pl-6 pr-12 rounded-2xl bg-gray-50 border-0 focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-300"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">평</span>
                </div>
              </div>

              <Button 
                onClick={handleCalculate} 
                disabled={loading}
                className="w-full h-14 rounded-2xl text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 animate-pulse" /> 분석 중...
                  </span>
                ) : (
                  "무료 견적 확인하기"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 2. 결과 섹션 (영수증 스타일) */}
        {result && (
          <div className="mt-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            
            {/* 메인 결과 카드 */}
            <div className="relative">

              <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 pb-8">
                    <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">
                      {result.rangeInfo.range} 기준
                    </Badge>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">예상 총 견적</p>
                      <div className="text-5xl font-black text-blue-600 flex items-end justify-center gap-1">
                        {displayTotal.toLocaleString()}
                        <span className="text-2xl font-bold text-gray-400 mb-1">만원</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 text-center mt-3">
                      최소 {(result.min / 10000).toLocaleString()}만 ~ 최대 {(result.max / 10000).toLocaleString()}만원
                    </p>

                    {/* 구분선 */}
                    <div className="border-t border-dashed border-gray-200 my-6" />

                    {/* 세부 내역 */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">상세 견적 내역</p>
                      {result.details.map((item: any, i: number) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">{item.name}</span>
                            <span className="text-sm font-bold text-gray-900">
                              {(item.cost / 10000).toLocaleString()}만원
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700"
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-start gap-2 mt-6 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-700">
                        위 견적은 빅데이터 평균값이며, 실제 현장 상황(자재 등급, 철거 여부 등)에 따라 달라질 수 있습니다.
                      </p>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 상담 신청 CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
              <div className="max-w-2xl mx-auto">
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full h-14 rounded-2xl text-lg font-bold bg-gray-900 hover:bg-black shadow-xl"
                >
                  전문가 무료 방문 견적 신청
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
            
            {/* 하단 여백 확보 */}
            <div className="h-24" />
          </div>
        )}
      </div>

      {/* 상담 신청 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">전문가 상담 신청</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 pt-1">
              연락처를 남겨주시면 지역 내 검증된 파트너가<br/>
              무료로 방문하여 정확한 견적을 내드립니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>연락처</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="010-1234-5678" 
                  className="pl-10 h-12 rounded-xl"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>시공 희망 지역</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="예: 서울 강남구 역삼동" 
                  className="pl-10 h-12 rounded-xl"
                  value={contactForm.location}
                  onChange={(e) => setContactForm({...contactForm, location: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitRequest} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold">
              신청 완료하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Chatbot />
    </div>
  );
}
