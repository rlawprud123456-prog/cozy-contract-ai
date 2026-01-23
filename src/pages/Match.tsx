import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, Building2, Bath, CheckCircle2, Briefcase } from "lucide-react";
import Chatbot from "@/components/Chatbot";

export default function Match() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({ type: "", budget: "", style: "" });

  const handleSelect = (key: string, value: string) => {
    setSelection({ ...selection, [key]: value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const spaceTypes = [
    { id: "apt", label: "아파트", icon: <Home className="w-8 h-8" /> },
    { id: "office", label: "사무실/상가", icon: <Briefcase className="w-8 h-8" /> },
    { id: "studio", label: "원룸/오피스텔", icon: <Building2 className="w-8 h-8" /> },
    { id: "bath", label: "욕실/주방", icon: <Bath className="w-8 h-8" /> },
  ];

  const budgetOptions = [
    "1,000만원 미만",
    "1,000만원 ~ 3,000만원",
    "3,000만원 ~ 5,000만원",
    "5,000만원 이상",
    "잘 모르겠어요"
  ];

  const styleOptions = ["모던/심플", "내추럴/우드", "빈티지", "럭셔리/호텔", "화이트"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-foreground">맞춤 전문가 찾기</h1>
        <div className="flex-1" />
      </header>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-8">
        {/* 진행 상태 바 */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-colors ${step >= i ? "bg-primary" : "bg-gray-200"}`} 
            />
          ))}
        </div>

        {/* 질문 영역 */}
        <div className="flex-1">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {step === 1 && "어떤 공간을 바꾸고 싶으신가요?"}
              {step === 2 && "생각하시는 예산대는 얼마인가요?"}
              {step === 3 && "선호하는 스타일이 있나요?"}
            </h2>
            <p className="text-muted-foreground">딱 맞는 전문가를 연결해 드릴게요.</p>
          </div>

          {/* Step 1: 공간 선택 */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              {spaceTypes.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => handleSelect("type", item.id)}
                  className={`p-6 cursor-pointer transition-all border-2 hover:shadow-md ${
                    selection.type === item.id 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-transparent bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className={`mb-3 ${selection.type === item.id ? "text-primary" : "text-muted-foreground"}`}>
                    {item.icon}
                  </div>
                  <span className={`font-bold ${selection.type === item.id ? "text-primary" : "text-foreground"}`}>
                    {item.label}
                  </span>
                </Card>
              ))}
            </div>
          )}

          {/* Step 2: 예산 선택 */}
          {step === 2 && (
            <div className="space-y-3">
              {budgetOptions.map((label) => (
                <Card
                  key={label}
                  onClick={() => handleSelect("budget", label)}
                  className={`w-full p-5 cursor-pointer text-left font-bold text-lg transition-all border-2 ${
                    selection.budget === label 
                      ? "border-primary bg-primary/5 text-primary shadow-md" 
                      : "border-transparent bg-card text-foreground hover:bg-muted/50"
                  }`}
                >
                  {label}
                </Card>
              ))}
            </div>
          )}

          {/* Step 3: 스타일 선택 */}
          {step === 3 && (
            <div className="grid grid-cols-2 gap-3">
              {styleOptions.map((style) => (
                <Card
                  key={style}
                  onClick={() => handleSelect("style", style)}
                  className={`h-24 flex items-center justify-center cursor-pointer font-bold text-lg transition-all border-2 ${
                    selection.style === style 
                      ? "border-primary bg-primary/5 text-primary shadow-md" 
                      : "border-transparent bg-card text-foreground hover:bg-muted/50"
                  }`}
                >
                  {style}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="pt-8 mt-auto">
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="outline" size="lg" onClick={prevStep} className="h-14 px-6 rounded-xl">
                이전
              </Button>
            )}
            <Button 
              size="lg" 
              className="flex-1 h-14 rounded-xl font-bold text-lg"
              disabled={
                (step === 1 && !selection.type) ||
                (step === 2 && !selection.budget) ||
                (step === 3 && !selection.style)
              }
              onClick={() => {
                if (step < 3) nextStep();
                else navigate('/partners');
              }}
            >
              {step === 3 ? "전문가 매칭하기" : "다음"}
            </Button>
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
}
