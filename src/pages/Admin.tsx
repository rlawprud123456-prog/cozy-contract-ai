import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Briefcase, FileText, Shield, Calculator, Sparkles } from "lucide-react";

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [estimateRequests, setEstimateRequests] = useState<any[]>([]);
  const [generatingEstimate, setGeneratingEstimate] = useState<string | null>(null);
  const [aiEstimate, setAiEstimate] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast({
          title: "접근 권한 없음",
          description: "관리자만 접근할 수 있습니다.",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadData();
    } catch (error) {
      console.error("Admin access check error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [usersRes, partnersRes, contractsRes, estimatesRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("partners").select("*"),
        supabase.from("contracts").select("*"),
        supabase.from("estimate_requests").select("*").order("created_at", { ascending: false })
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (partnersRes.data) setPartners(partnersRes.data);
      if (contractsRes.data) setContracts(contractsRes.data);
      if (estimatesRes.data) setEstimateRequests(estimatesRes.data);
    } catch (error) {
      console.error("Data loading error:", error);
    }
  };

  const updatePartnerStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("partners")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "상태 업데이트 완료",
        description: `파트너 상태가 ${status}로 변경되었습니다.`
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "업데이트 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateEstimateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("estimate_requests")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "상태 업데이트 완료",
        description: `견적 신청 상태가 ${status}로 변경되었습니다.`
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "업데이트 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const generateAIEstimate = async (estimateId: string) => {
    setGeneratingEstimate(estimateId);
    setAiEstimate(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-estimate', {
        body: { estimateRequestId: estimateId }
      });

      if (error) throw error;

      if (data.success) {
        setAiEstimate(data);
        toast({
          title: "AI 견적서 생성 완료",
          description: "상세 견적서가 생성되었습니다.",
        });
      } else {
        throw new Error(data.error || 'AI 견적 생성 실패');
      }
    } catch (error: any) {
      console.error('AI estimate generation error:', error);
      toast({
        title: "AI 견적 생성 실패",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setGeneratingEstimate(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">관리자 대시보드</h1>
          </div>
          <p className="text-muted-foreground">플랫폼 전체 데이터를 관리합니다</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">파트너</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partners.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">견적 신청</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estimateRequests.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">계약</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="estimates" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="estimates">견적 신청</TabsTrigger>
            <TabsTrigger value="partners">파트너 신청</TabsTrigger>
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="contracts">계약 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="estimates" className="space-y-4">
            {aiEstimate && (
              <Card className="border-primary bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">AI 생성 견적서</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setAiEstimate(null)}
                    >
                      닫기
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-lg mb-1">
                        프로젝트: {aiEstimate.estimateRequest.project_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {aiEstimate.estimateRequest.category} | {aiEstimate.estimateRequest.area}평 | {aiEstimate.estimateRequest.location}
                      </p>
                    </div>

                    <div className="bg-background p-4 rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        총 예상 금액: {aiEstimate.estimate.total_amount.toLocaleString()}원
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        예상 작업 기간: {aiEstimate.estimate.duration_days}일
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">항목별 비용</h4>
                      <div className="space-y-2">
                        {aiEstimate.estimate.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-start p-2 bg-background rounded">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              )}
                            </div>
                            <p className="font-semibold">{item.amount.toLocaleString()}원</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">작업 일정</h4>
                      <div className="space-y-2">
                        {aiEstimate.estimate.schedule.map((stage: any, idx: number) => (
                          <div key={idx} className="p-3 bg-background rounded">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-medium">{stage.stage}</p>
                              <Badge variant="outline">{stage.duration}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{stage.tasks}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {aiEstimate.recommendedPartner && (
                      <div>
                        <h4 className="font-semibold mb-2">추천 파트너</h4>
                        <div className="p-3 bg-background rounded">
                          <p className="font-medium">{aiEstimate.recommendedPartner.business_name}</p>
                          <p className="text-sm text-muted-foreground">{aiEstimate.recommendedPartner.category}</p>
                          {aiEstimate.recommendedPartner.description && (
                            <p className="text-xs text-muted-foreground mt-1">{aiEstimate.recommendedPartner.description}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">추천사항 및 주의사항</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {aiEstimate.estimate.recommendations}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {estimateRequests.map((estimate) => (
              <Card key={estimate.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-foreground">{estimate.project_name}</p>
                        <Badge variant={
                          estimate.status === 'approved' ? 'default' : 
                          estimate.status === 'rejected' ? 'destructive' : 
                          'secondary'
                        }>
                          {estimate.status === 'approved' ? '승인됨' : 
                           estimate.status === 'rejected' ? '거절됨' : '대기중'}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-medium">의뢰인:</span> {estimate.client_name}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">연락처:</span> {estimate.phone}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">위치:</span> {estimate.location}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">카테고리:</span> {estimate.category}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">평수:</span> {estimate.area}평
                        </p>
                        {estimate.estimated_budget && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">예산:</span> {Number(estimate.estimated_budget).toLocaleString()}원
                          </p>
                        )}
                        {estimate.description && (
                          <p className="text-muted-foreground mt-2">
                            <span className="font-medium">설명:</span> {estimate.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          신청일: {new Date(estimate.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="gap-2"
                        onClick={() => generateAIEstimate(estimate.id)}
                        disabled={generatingEstimate === estimate.id}
                      >
                        <Sparkles className="w-4 h-4" />
                        {generatingEstimate === estimate.id ? 'AI 분석 중...' : 'AI 견적 생성'}
                      </Button>
                      {estimate.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateEstimateStatus(estimate.id, 'approved')}
                          >
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateEstimateStatus(estimate.id, 'rejected')}
                          >
                            거절
                          </Button>
                        </>
                      )}
                      {estimate.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateEstimateStatus(estimate.id, 'pending')}
                        >
                          대기로 변경
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {estimateRequests.length === 0 && (
              <p className="text-center text-muted-foreground py-12">등록된 견적 신청이 없습니다</p>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{user.name || "이름 없음"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        가입일: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {users.length === 0 && (
              <p className="text-center text-muted-foreground py-12">등록된 사용자가 없습니다</p>
            )}
          </TabsContent>

          <TabsContent value="partners" className="space-y-4">
            {partners.map((partner) => (
              <Card key={partner.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <p className="font-semibold text-lg text-foreground">{partner.business_name}</p>
                        <Badge variant={
                          partner.status === 'approved' ? 'default' : 
                          partner.status === 'rejected' ? 'destructive' : 
                          'secondary'
                        }>
                          {partner.status === 'approved' ? '승인됨' : 
                           partner.status === 'rejected' ? '거절됨' : '대기중'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-medium">이메일:</span> {partner.email}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">전화번호:</span> {partner.phone}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">카테고리:</span> {partner.category}
                        </p>
                        {partner.description && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">설명:</span> {partner.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          신청일: {new Date(partner.created_at).toLocaleString()}
                        </p>
                      </div>

                      {partner.business_license && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">사업자등록증</p>
                          <a 
                            href={partner.business_license} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            파일 보기
                          </a>
                        </div>
                      )}

                      {partner.portfolio_images && partner.portfolio_images.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">포트폴리오 ({partner.portfolio_images.length}장)</p>
                          <div className="grid grid-cols-3 gap-2">
                            {partner.portfolio_images.map((img: string, idx: number) => (
                              <a 
                                key={idx}
                                href={img}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img 
                                  src={img} 
                                  alt={`포트폴리오 ${idx + 1}`}
                                  className="w-full h-24 object-cover rounded border border-border hover:opacity-80 transition-opacity"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {partner.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updatePartnerStatus(partner.id, 'approved')}
                          >
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updatePartnerStatus(partner.id, 'rejected')}
                          >
                            거절
                          </Button>
                        </>
                      )}
                      {partner.status !== 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePartnerStatus(partner.id, 'pending')}
                        >
                          대기로 변경
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {partners.length === 0 && (
              <p className="text-center text-muted-foreground py-12">등록된 파트너 신청이 없습니다</p>
            )}
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            {contracts.map((contract) => (
              <Card key={contract.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-foreground">{contract.title}</p>
                        <Badge>{contract.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{contract.description}</p>
                      {contract.amount && (
                        <p className="text-sm font-medium mt-1">
                          금액: {Number(contract.amount).toLocaleString()}원
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        생성일: {new Date(contract.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {contracts.length === 0 && (
              <p className="text-center text-muted-foreground py-12">등록된 계약이 없습니다</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
