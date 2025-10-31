import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { contracts } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

type RiskLevel = "low" | "medium" | "high" | null;

interface ContractReviewProps {
  user: any;
}

export default function ContractReview({ user }: ContractReviewProps) {
  const { toast } = useToast();
  const [contractText, setContractText] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContract = async () => {
    setIsAnalyzing(true);
    
    // 간단한 키워드 기반 위험도 분석 시뮬레이션
    setTimeout(async () => {
      const text = contractText.toLowerCase();
      let risk: RiskLevel = "low";
      const newSuggestions: string[] = [];

      if (text.includes("위약금") || text.includes("손해배상")) {
        risk = "high";
        newSuggestions.push("위약금 조항이 과도하지 않은지 확인이 필요합니다.");
      }
      
      if (text.includes("일방적") || text.includes("임의로")) {
        if (risk !== "high") risk = "medium";
        newSuggestions.push("일방적인 계약 변경 조항이 포함되어 있습니다.");
      }

      if (!text.includes("하자") && !text.includes("보증")) {
        if (risk === "low") risk = "medium";
        newSuggestions.push("하자 보수 및 보증 기간에 대한 명시가 부족합니다.");
      }

      if (newSuggestions.length === 0) {
        newSuggestions.push("전반적으로 안전한 계약서입니다.");
        newSuggestions.push("추가로 전문가 검토를 받으시면 더욱 좋습니다.");
      }

      setRiskLevel(risk);
      setSuggestions(newSuggestions);
      setIsAnalyzing(false);

      // 로그인한 경우 검토 이력 저장
      if (user) {
        const riskText = risk === "low" ? "낮음" : risk === "medium" ? "보통" : "높음";
        await contracts.saveAnalysis({
          text: contractText,
          risk: riskText,
          suggestions: newSuggestions.join(" "),
        });
        toast({ title: "저장 완료", description: "검토 이력이 저장되었습니다" });
      }
    }, 1500);
  };

  const getRiskBadge = () => {
    switch (riskLevel) {
      case "low":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            낮음
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <AlertTriangle className="w-4 h-4 mr-1" />
            보통
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white">
            <AlertCircle className="w-4 h-4 mr-1" />
            높음
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="container mx-auto max-w-5xl py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
            계약서 검토 서비스
          </h1>
          <p className="text-muted-foreground">
            인테리어 계약서를 분석하여 위험 요소를 찾아드립니다
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>계약서 내용 입력</CardTitle>
              <CardDescription>
                계약서 텍스트를 붙여넣어 주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="계약서 내용을 여기에 붙여넣어 주세요..."
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
                className="min-h-[300px] resize-none"
              />
              <Button
                onClick={analyzeContract}
                disabled={!contractText.trim() || isAnalyzing}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isAnalyzing ? "분석 중..." : "계약서 분석하기"}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                분석 결과
                {riskLevel && getRiskBadge()}
              </CardTitle>
              <CardDescription>
                AI 기반 위험도 평가 및 개선 제안
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!riskLevel ? (
                <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
                  계약서를 입력하고 분석을 시작해주세요
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">위험도 평가</h3>
                    <p className="text-sm text-muted-foreground">
                      {riskLevel === "low" && "계약서가 비교적 안전합니다."}
                      {riskLevel === "medium" && "일부 검토가 필요한 조항이 있습니다."}
                      {riskLevel === "high" && "주의가 필요한 조항이 발견되었습니다."}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">개선 제안</h3>
                    <ul className="space-y-2">
                      {suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-accent mt-1">•</span>
                          <span className="text-sm text-muted-foreground">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {user && (
                    <div className="pt-4 border-t">
                      <Link to="/history">
                        <Button variant="outline" className="w-full">
                          검토 이력 보기
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
