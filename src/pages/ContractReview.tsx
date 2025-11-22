import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, AlertTriangle, Lightbulb, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CONTRACT_PATTERN_EXAMPLES } from "@/constants/contractPatterns";

interface Issue {
  clause_hint: string;
  type: string;
  severity: "낮음" | "보통" | "높음" | "매우 높음";
  excerpt: string;
  reason: string;
  recommendation: string;
}

interface AnalysisResult {
  risk_score: number;
  risk_level: "낮음" | "보통" | "높음" | "매우 높음";
  issues: Issue[];
  summary: string;
  safe_tips: string[];
}

interface ContractReviewProps {
  user: any;
}

export default function ContractReview({ user }: ContractReviewProps) {
  const { toast } = useToast();
  const [contractText, setContractText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContract = async () => {
    if (!contractText.trim() || contractText.trim().length < 50) {
      toast({
        title: "입력 오류",
        description: "계약서 내용을 최소 50자 이상 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('contract-review', {
        body: { contractText }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisResult(data);
      toast({ 
        title: "분석 완료", 
        description: "계약서 검토가 완료되었습니다." 
      });

    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "분석 실패",
        description: error.message || "계약서 분석 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskBadge = (level?: string) => {
    const riskLevel = level || analysisResult?.risk_level;
    switch (riskLevel) {
      case "낮음":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            낮음
          </Badge>
        );
      case "보통":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <AlertTriangle className="w-4 h-4 mr-1" />
            보통
          </Badge>
        );
      case "높음":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
            <AlertCircle className="w-4 h-4 mr-1" />
            높음
          </Badge>
        );
      case "매우 높음":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white">
            <AlertCircle className="w-4 h-4 mr-1" />
            매우 높음
          </Badge>
        );
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "낮음":
        return <Badge variant="outline" className="text-green-600 border-green-600">낮음</Badge>;
      case "보통":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">보통</Badge>;
      case "높음":
        return <Badge variant="outline" className="text-orange-600 border-orange-600">높음</Badge>;
      case "매우 높음":
        return <Badge variant="outline" className="text-red-600 border-red-600">매우 높음</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-3 sm:p-4">
      <div className="container mx-auto max-w-5xl py-4 sm:py-6 md:py-8">
        <div className="mb-6 sm:mb-8 text-center px-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 sm:mb-3">
            계약서 검토 서비스
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            인테리어 계약서를 분석하여 위험 요소를 찾아드립니다
          </p>
        </div>

        <Tabs defaultValue="review" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="review">계약서 검토</TabsTrigger>
            <TabsTrigger value="examples">예시 보기</TabsTrigger>
          </TabsList>

          <TabsContent value="review">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
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
              <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-base sm:text-lg md:text-xl">분석 결과</span>
                {analysisResult && getRiskBadge()}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                AI 기반 위험도 평가 및 개선 제안
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!analysisResult ? (
                <div className="flex items-center justify-center min-h-[300px] text-muted-foreground text-sm sm:text-base text-center px-4">
                  계약서를 입력하고 분석을 시작해주세요
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {/* 위험도 점수 */}
                  <div className="p-3 sm:p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">위험도 점수</h3>
                      <span className="text-xl sm:text-2xl font-bold text-primary">{analysisResult.risk_score}/100</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${analysisResult.risk_score}%` }}
                      />
                    </div>
                  </div>

                  {/* 요약 */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">종합 평가</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {analysisResult.summary}
                    </p>
                  </div>
                  
                  {/* 발견된 문제점 */}
                  {analysisResult.issues.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">발견된 문제점 ({analysisResult.issues.length}개)</h3>
                      <Accordion type="single" collapsible className="w-full">
                        {analysisResult.issues.map((issue, idx) => (
                          <AccordionItem key={idx} value={`item-${idx}`}>
                            <AccordionTrigger className="text-left text-xs sm:text-sm hover:no-underline">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full pr-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {getSeverityBadge(issue.severity)}
                                  <span className="font-medium">{issue.type}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {issue.clause_hint}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-xs sm:text-sm space-y-3 pt-2">
                              <div>
                                <p className="text-muted-foreground font-medium mb-1">📄 발췌:</p>
                                <p className="text-muted-foreground italic pl-3 border-l-2 border-muted">
                                  "{issue.excerpt}"
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground font-medium mb-1">⚠️ 문제점:</p>
                                <p className="text-foreground">{issue.reason}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground font-medium mb-1">💡 권고사항:</p>
                                <p className="text-foreground">{issue.recommendation}</p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}

                  {/* 안전 팁 */}
                  {analysisResult.safe_tips.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-3 sm:p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-semibold text-foreground text-sm sm:text-base">안전한 계약을 위한 팁</h3>
                      </div>
                      <ul className="space-y-2">
                        {analysisResult.safe_tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                            <span className="text-blue-600 dark:text-blue-400 mt-1 shrink-0">✓</span>
                            <span className="text-muted-foreground">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
            </div>
          </TabsContent>

          <TabsContent value="examples">
            <div className="space-y-6">
              <Card className="shadow-[var(--shadow-card)]">
                <CardHeader>
                  <CardTitle>문제계약서 vs 정상계약서 비교</CardTitle>
                  <CardDescription>
                    실제 사례를 바탕으로 한 문제계약서와 정상계약서 예시입니다
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-4 sm:gap-6">
                {CONTRACT_PATTERN_EXAMPLES.map((example) => (
                  <Card key={example.id} className="shadow-[var(--shadow-card)]">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
                        <span className="text-primary">{example.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* 문제계약서 */}
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                          <div className="flex items-center gap-2 mb-3">
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                            <h4 className="font-semibold text-red-900 dark:text-red-300 text-sm sm:text-base">
                              {example.problemLabel}
                            </h4>
                          </div>
                          <pre className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                            {example.problemText}
                          </pre>
                        </div>

                        {/* 정상계약서 */}
                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                            <h4 className="font-semibold text-green-900 dark:text-green-300 text-sm sm:text-base">
                              {example.normalLabel}
                            </h4>
                          </div>
                          <pre className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                            {example.normalText}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
