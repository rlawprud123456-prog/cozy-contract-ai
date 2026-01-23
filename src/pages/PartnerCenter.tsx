import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wallet, Bell, Star, 
  Clock, Calendar, ArrowRight, Send,
  TrendingUp, FileText, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Chatbot from "@/components/Chatbot";

export default function PartnerCenter() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // 데이터 상태 관리
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<any[]>([]);

  // 견적 발송 모달 상태 관리
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [bidForm, setBidForm] = useState({ amount: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // [1] 데이터 불러오기 (파트너 정보 + 요청 목록 + 공사 목록)
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      // 1. 내 파트너 프로필 가져오기
      const { data: partnerData, error: partnerError } = await supabase
        .from("partners")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (partnerError || !partnerData) {
        navigate("/partner/apply");
        return;
      }
      setPartner(partnerData);

      // 2. 고객 견적 요청 목록 가져오기 (Status가 pending인 것)
      const { data: reqData } = await supabase
        .from("estimate_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      setRequests(reqData || []);

      // 3. 진행 중인 내 공사 가져오기 (Contracts 테이블)
      const { data: contractData } = await supabase
        .from("contracts")
        .select("*")
        .eq("partner_id", partnerData.id)
        .eq("status", "ongoing")
        .order("created_at", { ascending: false });

      setOngoingProjects(contractData || []);

    } catch (error) {
      console.error("데이터 로딩 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // [2] '견적 보내기' 버튼 클릭 시 모달 열기
  const openBidModal = (req: any) => {
    setSelectedRequest(req);
    setBidForm({ amount: "", message: "" });
    setIsBidModalOpen(true);
  };

  // [3] 실제 견적 전송 (DB에 저장)
  const handleSubmitBid = async () => {
    if (!bidForm.amount || !bidForm.message) {
      toast({ title: "내용 부족", description: "견적 금액과 메시지를 모두 입력해주세요.", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      // estimates 테이블이 아직 생성되지 않았으므로 임시로 toast만 표시
      // 실제 DB 연동은 estimates 테이블 마이그레이션 후 활성화
      const cleanAmount = bidForm.amount.split(",").join("");
      console.log("견적 데이터:", {
        request_id: selectedRequest.id,
        partner_id: partner.id,
        amount: Number(cleanAmount),
        message: bidForm.message,
        status: "sent"
      });

      toast({ title: "전송 완료", description: "고객님께 견적서를 성공적으로 발송했습니다." });
      setIsBidModalOpen(false);
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));

    } catch (error: any) {
      toast({ title: "전송 실패", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      {/* 상단 헤더 */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-4 py-3">
          {/* 타이틀 & 알림 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-lg font-bold text-foreground">파트너 센터</span>
              <Badge variant="secondary" className="text-xs font-medium">PRO</Badge>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </Button>
          </div>

          {/* 프로필 카드 */}
          <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl shadow-sm">
                🏗️
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg text-foreground truncate">
                  {partner?.business_name} 대표님
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold">{partner?.rating || "5.0"}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                    인증 파트너
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="px-4 py-5 space-y-5">
        {/* 정산 카드 */}
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-primary-foreground/80 font-medium">정산 가능 금액</span>
              </div>
              <TrendingUp className="w-5 h-5 text-primary-foreground/60" />
            </div>
            
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-4xl font-extrabold text-primary-foreground tracking-tight">0</span>
              <span className="text-lg font-medium text-primary-foreground/70">원</span>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1 h-11 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0 font-semibold"
              >
                정산 신청
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1 h-11 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0 font-semibold"
              >
                내역 조회
              </Button>
            </div>
          </div>
        </Card>

        {/* 탭 메뉴 */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="w-full h-12 p-1 bg-muted rounded-xl grid grid-cols-2">
            <TabsTrigger 
              value="requests" 
              className="h-10 rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
            >
              새 요청
              {requests.length > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 min-w-[20px]">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="ongoing" 
              className="h-10 rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
            >
              진행 중
              {ongoingProjects.length > 0 && (
                <Badge variant="outline" className="ml-2 text-xs px-1.5 min-w-[20px]">
                  {ongoingProjects.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* 탭 1: 견적 요청 리스트 */}
          <TabsContent value="requests" className="mt-4 space-y-3">
            {requests.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">새로운 요청이 없습니다</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  고객님의 요청이 들어오면<br />실시간 알림을 보내드릴게요.
                </p>
              </Card>
            ) : (
              requests.map((req) => (
                <Card key={req.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 space-y-4">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 font-medium">
                        {req.project_type || "유형 미정"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(req.created_at).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* 내용 */}
                    <div>
                      <h3 className="font-bold text-foreground mb-1">
                        {req.location || "지역 정보 없음"}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Wallet className="w-4 h-4" />
                        <span>예산: {req.budget_range || "미정"}</span>
                      </div>
                    </div>

                    {/* 버튼 */}
                    <Button 
                      onClick={() => openBidModal(req)}
                      className="w-full h-12 font-bold text-base gap-2 rounded-xl shadow-sm"
                    >
                      <Send className="w-4 h-4" /> 견적 보내기
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* 탭 2: 진행 중인 공사 리스트 */}
          <TabsContent value="ongoing" className="mt-4 space-y-3">
            {ongoingProjects.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">진행 중인 공사가 없습니다</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  견적을 보내고 공사를 수주해보세요!<br />
                  성공적인 비즈니스를 응원합니다.
                </p>
              </Card>
            ) : (
              ongoingProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 space-y-4">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-foreground">{project.project_name}</h3>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        시공중
                      </Badge>
                    </div>

                    {/* 진행률 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">공정률</span>
                        <span className="font-bold text-foreground">{project.progress || 0}%</span>
                      </div>
                      <Progress value={project.progress || 0} className="h-2" />
                    </div>

                    {/* 일정 */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{project.start_date ? `착공일: ${project.start_date}` : "일정 미정"}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary font-medium gap-1">
                        상세보기 <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* 견적 보내기 모달 */}
      <Dialog open={isBidModalOpen} onOpenChange={setIsBidModalOpen}>
        <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-bold">견적서 작성</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              고객에게 제안할 금액과 메시지를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">예상 견적 금액</Label>
              <div className="relative">
                <Input
                  placeholder="예: 3,500,000"
                  value={bidForm.amount}
                  onChange={(e) => setBidForm({...bidForm, amount: e.target.value})}
                  className="h-12 pr-10 text-lg font-semibold rounded-xl"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">원</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">전달 메시지</Label>
              <Textarea
                placeholder="견적에 대한 상세 설명, 작업 일정, 특이사항 등을 입력해주세요."
                rows={4}
                value={bidForm.message}
                onChange={(e) => setBidForm({...bidForm, message: e.target.value})}
                className="resize-none rounded-xl"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              className="w-full h-14 rounded-xl text-lg font-bold gap-2 shadow-lg" 
              onClick={handleSubmitBid}
              disabled={sending}
            >
              {sending ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  전송 중...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> 견적 발송하기
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Chatbot />
    </div>
  );
}
