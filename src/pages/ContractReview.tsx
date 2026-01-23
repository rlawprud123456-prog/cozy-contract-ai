import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, UploadCloud, FileText, 
  ShieldCheck, AlertTriangle, CheckCircle2, 
  ChevronRight, Loader2, SearchCheck 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ContractReviewProps {
  user: any;
}

export default function ContractReview({ user }: ContractReviewProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"upload" | "analyzing" | "result">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  
  // 분석 결과 상태 (데모 데이터)
  const [result, setResult] = useState({
    score: 85,
    riskLevel: "양호", // 양호, 주의, 위험
    summary: "전반적으로 공정한 계약이나, 2가지 독소 조항이 발견되었습니다.",
    risks: [
      { id: 1, type: "critical", title: "과도한 지체상금", desc: "공사 지연 시 하루 0.3% 배상은 법적 허용치를 초과합니다." },
      { id: 2, type: "warning", title: "AS 기간 미명시", desc: "하자 보수 기간이 명확히 기재되지 않았습니다. (통상 1~2년)" },
    ],
    safeties: [
      { id: 3, title: "대금 지급 시기 명확", desc: "착공/중도/잔금 비율이 표준 계약서를 따르고 있습니다." },
      { id: 4, title: "자재 내역 상세 포함", desc: "사용되는 자재의 브랜드와 등급이 명시되어 있습니다." },
    ]
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      startAnalysis();
    }
  };

  const startAnalysis = () => {
    setStep("analyzing");
    // 프로그레스바 애니메이션 시뮬레이션
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p > 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setStep("result"), 800); // 100% 도달 후 결과 화면으로
      }
      setProgress(p);
    }, 300);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b z-30 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">AI 계약서 진단</h1>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto">
        
        {/* Step 1: 업로드 화면 */}
        {step === "upload" && (
          <div className="space-y-8 pt-8">

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchCheck className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
                계약서를 찍어 올리면<br />
                3초 만에 분석해드려요.
              </h2>
              <p className="text-gray-500 mt-2">독소 조항, 누락된 특약 사항을 AI가 찾아냅니다.</p>
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,image/*" className="hidden" />
            <Card 
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-2xl cursor-pointer hover:bg-blue-100/50 transition text-center"
            >
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-7 h-7 text-white" />
              </div>
              <p className="text-lg font-bold text-gray-800">파일 업로드</p>
              <p className="text-sm text-gray-500 mt-1">PDF 또는 이미지 파일 (최대 10MB)</p>
            </Card>

            <div className="bg-white p-5 rounded-2xl border">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <FileText className="w-4 h-4 text-blue-600" /> 이런걸 분석해요
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> 불공정한 위약금 조항 여부
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> 하자보수(AS) 기간 누락 확인
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> 표준 계약서 대비 누락된 필수 조항
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: 분석 중 화면 */}
        {step === "analyzing" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">

            <div className="relative w-24 h-24">
              {/* 애니메이션 원 */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping opacity-50"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            </div>
            
            <div>
              <p className="text-xl font-bold text-gray-900">AI가 계약서를 분석 중입니다</p>
              <p className="text-gray-500 mt-1">잠시만 기다려주세요... {Math.round(progress)}%</p>
            </div>
            
            <div className="w-full max-w-xs">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        )}

        {/* Step 3: 분석 결과 화면 */}
        {step === "result" && (
          <div className="space-y-5 pb-32">

            {/* 점수 카드 */}
            <Card className="p-6 text-center bg-gradient-to-br from-white to-blue-50 rounded-2xl border-0 shadow-lg">
              <Badge className="bg-green-100 text-green-700 border-none mb-3">
                <ShieldCheck className="w-3 h-3 mr-1" />{result.riskLevel}
              </Badge>
              <p className="text-sm text-gray-500 font-medium">계약서 안전 점수</p>
              <p className="text-5xl font-black my-3">
                <span className={getScoreColor(result.score)}>
                  {result.score}
                </span>
                <span className="text-2xl text-gray-400">/ 100</span>
              </p>

              <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-xl">
                "{result.summary}"
              </p>
            </Card>

            {/* 위험 요소 리스트 */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> 발견된 위험 요소
                <Badge variant="destructive" className="ml-auto">{result.risks.length}</Badge>
              </h3>
              <div className="space-y-3">
                {result.risks.map((risk) => (
                  <Card key={risk.id} className="p-4 rounded-2xl border-red-100 bg-red-50/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={risk.type === "critical" ? "destructive" : "outline"} className="text-xs">
                        {risk.type === "critical" ? "심각" : "주의"}
                      </Badge>
                    </div>
                    <p className="font-semibold text-gray-900">{risk.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{risk.desc}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* 안전 요소 리스트 (접이식 느낌) */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> 잘 작성된 조항
              </h3>
              <div className="bg-white p-4 rounded-2xl border space-y-4">
                {result.safeties.map((safe) => (
                  <div key={safe.id} className="flex items-start gap-3">
                    <div className="shrink-0 pt-0.5">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{safe.title}</p>
                      <p className="text-xs text-gray-500">{safe.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 하단 고정 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-20">
              <div className="max-w-xl mx-auto grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => setStep("upload")}>
                  다시 검토하기
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  전문가 상담 요청
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
