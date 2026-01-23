import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, Hammer, Paintbrush, Truck, 
  CheckCircle2, ShieldCheck, 
  Wallet, Users, ArrowLeft, Clock 
} from "lucide-react";
import Chatbot from "@/components/Chatbot";

interface ExistingPartner {
  id: string;
  business_name: string;
  status: string;
  created_at: string;
}

export default function PartnerApply() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingPartner, setExistingPartner] = useState<ExistingPartner | null>(null);

  const [formData, setFormData] = useState({
    business_name: "",
    phone: "",
    email: "",
    location: "",
    category: "",
    description: "",
  });

  // 카테고리 옵션
  const categories = [
    { id: "종합 인테리어", icon: Building2, label: "종합 인테리어" },
    { id: "부분 시공", icon: Hammer, label: "부분 시공" },
    { id: "홈 스타일링", icon: Paintbrush, label: "홈 스타일링" },
    { id: "이사/청소", icon: Truck, label: "이사/청소" },
  ];

  useEffect(() => {
    checkExistingApplication();
  }, []);

  const checkExistingApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "로그인 필요", description: "파트너 신청을 위해 먼저 로그인해주세요." });
        navigate("/login");
        return;
      }

      const { data } = await supabase
        .from("partners")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setExistingPartner(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast({ title: "카테고리 선택", description: "전문 분야를 선택해주세요.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const { error } = await supabase.from("partners").insert({
        user_id: user.id,
        business_name: formData.business_name,
        phone: formData.phone,
        email: formData.email || user.email,
        location: formData.location,
        category: formData.category,
        description: formData.description,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "신청 완료!",
        description: "심사 후 승인 결과가 알림으로 전송됩니다.",
      });
      checkExistingApplication(); // 상태 갱신
    } catch (error: any) {
      toast({ title: "신청 실패", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">로딩 중...</p></div>;

  // 1. 이미 신청한 경우 (심사 대기/승인 완료 화면)
  if (existingPartner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 border-0 shadow-2xl rounded-3xl text-center">
          {existingPartner.status === "approved" ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <div className="space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-gray-900">파트너 승인 완료!</h2>
                <p className="text-gray-500">
                  축하합니다. 이제 바로고침의 파트너로서<br/>
                  고객들의 견적을 받아보실 수 있습니다.
                </p>
              </div>
              <Button 
                onClick={() => navigate("/partner-center")} 
                className="w-full h-14 rounded-2xl text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
              >
                파트너 센터 입장하기
              </Button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-amber-600" />
              </div>
              <div className="space-y-2 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">심사가 진행 중입니다</h2>
                <p className="text-gray-500">
                  제출해주신 서류를 꼼꼼히 검토하고 있습니다.<br/>
                  (영업일 기준 1~3일 소요)
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">신청 업체명</span>
                  <span className="font-bold text-gray-900">{existingPartner.business_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">신청일</span>
                  <span className="font-bold text-gray-900">{new Date(existingPartner.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Button onClick={() => navigate("/")} className="w-full h-14 rounded-2xl font-bold" variant="outline">
                메인으로 돌아가기
              </Button>
            </>
          )}
        </Card>
      </div>
    );
  }

  // 2. 신청 폼 화면
  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white pt-6 pb-16 px-4 relative overflow-hidden">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-white hover:bg-white/10 mb-6 p-2 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-extrabold mb-2">
            성공적인 비즈니스,<br/>
            바로고침과 함께하세요.
          </h1>
          <p className="text-slate-300 text-sm">
            검증된 전문가님을 기다립니다.<br/>
            월 500건 이상의 견적 요청을 놓치지 마세요.
          </p>
        </div>
        
        {/* 배경 장식 */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-10 relative z-10">
        
        {/* 혜택 카드 슬라이드 (가로 스크롤) */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-6">
          <Card className="min-w-[140px] p-4 border-0 shadow-lg rounded-2xl bg-white shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="font-bold text-gray-800 text-sm">고객 연결</p>
            <p className="text-xs text-gray-500">원하는 지역/분야 매칭</p>
          </Card>
          <Card className="min-w-[140px] p-4 border-0 shadow-lg rounded-2xl bg-white shrink-0">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <p className="font-bold text-gray-800 text-sm">신뢰도 상승</p>
            <p className="text-xs text-gray-500">공식 파트너 인증 배지</p>
          </Card>
          <Card className="min-w-[140px] p-4 border-0 shadow-lg rounded-2xl bg-white shrink-0">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
              <Wallet className="w-5 h-5 text-amber-600" />
            </div>
            <p className="font-bold text-gray-800 text-sm">정산 보장</p>
            <p className="text-xs text-gray-500">에스크로 안전 대금</p>
          </Card>
        </div>

        {/* 신청 폼 */}
        <Card className="border-0 shadow-xl rounded-3xl p-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <span className="font-bold text-gray-800">전문 분야 선택</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        formData.category === cat.id 
                          ? "border-blue-600 bg-blue-50 text-blue-700" 
                          : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                      }`}
                    >
                      <IconComponent className="w-6 h-6" />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <span className="font-bold text-gray-800">사업자 정보</span>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-sm text-gray-600">상호명 (사업자등록증 상)</Label>
                  <Input 
                    name="business_name" 
                    value={formData.business_name} 
                    onChange={handleChange} 
                    placeholder="예: (주)좋은인테리어" 
                    required 
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-gray-600">대표 연락처</Label>
                  <Input 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="010-0000-0000" 
                    required 
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-gray-600">이메일</Label>
                  <Input 
                    name="email" 
                    type="email"
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="partner@company.com" 
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-gray-600">주 활동 지역</Label>
                  <Input 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    placeholder="예: 서울 강남구" 
                    required 
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-gray-600">업체 소개 (경력, 특장점 등)</Label>
                  <Textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="고객에게 어필할 수 있는 내용을 자유롭게 적어주세요." 
                    rows={4}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full h-14 rounded-2xl text-lg font-bold bg-slate-900 hover:bg-slate-800 shadow-xl transition-all"
            >
              {submitting ? "제출 중..." : "파트너 신청하기"}
            </Button>
            
            <p className="text-center text-xs text-gray-400">
              신청 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
            </p>
          </form>
        </Card>
      </div>
      <Chatbot />
    </div>
  );
}
