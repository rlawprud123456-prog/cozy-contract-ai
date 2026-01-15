import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Clock, Briefcase, Star, XCircle } from "lucide-react";

interface ExistingApplication {
  id: string;
  business_name: string;
  status: string;
  created_at: string;
}

export default function PartnerApply() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [existingApplication, setExistingApplication] = useState<ExistingApplication | null>(null);
  
  const [formData, setFormData] = useState({
    businessName: "",
    phone: "",
    email: "",
    location: "",
    category: "",
    description: "",
  });

  const categories = [
    "아파트 인테리어",
    "주택 리모델링",
    "상업공간",
    "욕실/주방",
    "도배/장판",
    "목공",
    "전기/설비",
    "종합 인테리어",
  ];

  useEffect(() => {
    checkApplicationStatus();
  }, []);

  const checkApplicationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      const { data } = await supabase
        .from("partners")
        .select("id, business_name, status, created_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setExistingApplication(data);
      }
    } catch (error) {
      console.error("신청 현황 확인 오류:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({ 
          title: "로그인 필요", 
          description: "먼저 로그인해주세요.", 
          variant: "destructive" 
        });
        navigate("/login");
        return;
      }

      const { error } = await supabase.from("partners").insert({
        user_id: user.id,
        business_name: formData.businessName,
        phone: formData.phone,
        email: formData.email || user.email,
        location: formData.location,
        category: formData.category,
        description: formData.description,
        status: "pending"
      });

      if (error) throw error;

      toast({
        title: "신청 완료",
        description: "관리자 검토 후 승인됩니다. (영업일 기준 1-2일 소요)",
      });
      
      checkApplicationStatus();

    } catch (error: any) {
      toast({ 
        title: "오류 발생", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  // 기존 신청이 있는 경우 상태 표시
  if (existingApplication) {
    return (
      <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-4">
        <div className="container mx-auto max-w-md py-8">
          {existingApplication.status === 'pending' && (
            <Alert className="border-yellow-500/50 bg-yellow-50">
              <Clock className="h-5 w-5 text-yellow-600" />
              <AlertTitle className="text-yellow-800">승인 대기 중</AlertTitle>
              <AlertDescription className="text-yellow-700">
                <p className="mb-2">
                  <strong>{existingApplication.business_name}</strong> 신청이 접수되었습니다.
                </p>
                <p>관리자가 신청 내용을 검토하고 있습니다.</p>
                <p className="text-sm mt-2">검토가 완료되면 이메일로 알려드립니다.</p>
              </AlertDescription>
            </Alert>
          )}

          {existingApplication.status === 'approved' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-700">승인 완료!</h2>
              <p className="text-muted-foreground">
                이제 파트너 센터를 이용하실 수 있습니다.
              </p>
              <Button 
                onClick={() => navigate("/partner-center")}
                className="w-full"
              >
                파트너 센터로 이동
              </Button>
            </div>
          )}

          {existingApplication.status === 'rejected' && (
            <Alert className="border-red-500/50 bg-red-50">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-800">승인 거절</AlertTitle>
              <AlertDescription className="text-red-700">
                <p className="mb-2">
                  안타깝게도 신청이 승인되지 않았습니다.
                </p>
                <p className="text-sm">
                  자세한 내용은 고객센터로 문의해주세요.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-3 sm:p-4">
      <div className="container mx-auto max-w-2xl py-4 sm:py-6 md:py-8">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
            <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-accent" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              전문가 파트너 신청
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-2">
            새로고침과 함께 성장하는 인테리어 전문가가 되어보세요
          </p>

          {/* 파트너 혜택 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardContent className="pt-4 sm:pt-6 text-center">
                <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-1.5 sm:mb-2 text-accent" />
                <h3 className="font-semibold mb-1 text-sm sm:text-base">고객 연결</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">검증된 고객 매칭</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardContent className="pt-4 sm:pt-6 text-center">
                <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-1.5 sm:mb-2 text-accent" />
                <h3 className="font-semibold mb-1 text-sm sm:text-base">안전한 계약</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">에스크로 결제 보호</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardContent className="pt-4 sm:pt-6 text-center">
                <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-1.5 sm:mb-2 text-accent" />
                <h3 className="font-semibold mb-1 text-sm sm:text-base">비즈니스 성장</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">마케팅 지원</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>신청서 작성</CardTitle>
            <CardDescription>
              모든 정보를 정확하게 입력해주세요. 검토 후 1-2일 내 연락드립니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">업체명 (상호) *</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  placeholder="예: 디자인 팩토리"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">연락처 *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="010-0000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="partner@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">주 활동 지역 *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="예: 서울 강남구"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">주력 분야 *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">선택해주세요</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">업체 소개 *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="고객들에게 보여질 소개글을 적어주세요. 경력, 주요 시공 사례, 강점 등"
                  rows={4}
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  신청하시면 개인정보 수집 및 이용에 동의하는 것으로 간주됩니다.
                  수집된 정보는 파트너 심사 및 관리 목적으로만 사용됩니다.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "처리 중..." : "파트너 신청하기"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
