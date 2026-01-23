import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createContract } from "@/services/contract";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, Shield, Eye, User, MapPin, 
  Calendar, ArrowLeft, Calculator, CheckCircle2 
} from "lucide-react";
import ContractPreview from "@/components/ContractPreview";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContractCreateProps {
  user: any;
}

export default function ContractCreate({ user }: ContractCreateProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    partnerName: "",
    partnerPhone: "",
    projectName: "",
    location: "",
    totalAmount: "",
    depositAmount: "",
    midAmount: "",
    finalAmount: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  // AI 견적서 데이터 로드
  useEffect(() => {
    const estimateData = location.state?.estimateData;
    if (estimateData) {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() + 3);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (estimateData.estimate?.duration_days || 30));

      const total = estimateData.estimate?.total_amount || 0;

      setFormData({
        partnerName: estimateData.recommendedPartner?.business_name || "",
        partnerPhone: "",
        projectName: estimateData.estimateRequest?.project_name || "",
        location: estimateData.estimateRequest?.location || "",
        totalAmount: String(total),
        depositAmount: String(Math.floor(total * 0.3)),
        midAmount: String(Math.floor(total * 0.4)),
        finalAmount: String(Math.floor(total * 0.3)),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        description: estimateData.estimate?.recommendations || "",
      });

      toast({
        title: "데이터 연동 완료",
        description: "AI 견적서 내용을 바탕으로 계약서를 작성합니다.",
      });
    }
  }, [location.state]);

  // 유틸리티 함수
  const parseIntSafe = (v: string) => Number(v?.replace(/[^0-9]/g, "") || 0);
  
  const sumMoney = () =>
    parseIntSafe(formData.depositAmount) +
    parseIntSafe(formData.midAmount) +
    parseIntSafe(formData.finalAmount);

  const formatMoney = (value: string | number) => {
    const n = typeof value === "string" ? parseIntSafe(value) : value;
    if (!n) return "0";
    return n.toLocaleString("ko-KR");
  };

  // 자동 계산 기능 (총액 입력 시 자동 분배)
  const autoCalculate = (total: number) => {
    if (!total) return;
    const deposit = Math.floor(total * 0.3); // 30%
    const mid = Math.floor(total * 0.4);     // 40%
    const final = total - deposit - mid;     // 나머지 (잔금)

    setFormData(prev => ({
      ...prev,
      depositAmount: String(deposit),
      midAmount: String(mid),
      finalAmount: String(final)
    }));
    toast({ title: "자동 계산됨", description: "3:4:3 비율로 대금이 분배되었습니다." });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const moneyFields = ["totalAmount", "depositAmount", "midAmount", "finalAmount"];

    if (moneyFields.includes(name)) {
      const sanitized = value.replace(/[^\d]/g, "");
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      return;
    }

    if (name === "partnerPhone") {
      const digits = value.replace(/\D/g, "").slice(0, 11);
      let formatted = digits.replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 유효성 검사 및 제출 로직
  const validateCommon = () => {
    if (!formData.projectName || !formData.partnerName || !formData.totalAmount) {
      toast({ title: "필수 정보 누락", description: "프로젝트명, 전문가, 금액을 확인해주세요.", variant: "destructive" });
      return false;
    }
    const total = parseIntSafe(formData.totalAmount);
    if (total < 100000) {
      toast({ title: "금액 오류", description: "최소 계약금액은 10만원입니다.", variant: "destructive" });
      return false;
    }
    if (sumMoney() !== total) {
      toast({ title: "금액 불일치", description: "지급 단계별 금액의 합이 총액과 다릅니다.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      navigate("/login");
      return;
    }
    
    if (!validateCommon()) return;

    try {
      setSubmitting(true);
      await createContract({
        user_id: authData.user.id,
        title: formData.projectName,
        partner_name: formData.partnerName,
        partner_phone: formData.partnerPhone,
        project_name: formData.projectName,
        location: formData.location,
        total_amount: parseIntSafe(formData.totalAmount),
        deposit_amount: parseIntSafe(formData.depositAmount),
        mid_amount: parseIntSafe(formData.midAmount),
        final_amount: parseIntSafe(formData.finalAmount),
        start_date: formData.startDate,
        end_date: formData.endDate,
        description: formData.description,
      });
      navigate("/escrow");
    } catch (error: any) {
      toast({ title: "생성 실패", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">

      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">전자계약 작성</h1>
        </div>
        <Button
          variant="ghost"
          onClick={() => { if(validateCommon()) setShowPreview(true); }}
          className="text-blue-600 font-bold"
        >
          미리보기
        </Button>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {/* 안내 문구 */}
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
            안전한 시공을 위해<br />
            계약 내용을 입력해주세요.
          </h2>
          <p className="text-gray-500 mt-2">에스크로 시스템이 대금을 안전하게 보호합니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. 전문가 및 현장 정보 */}
          <Card className="p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-blue-600">
              <User className="w-5 h-5" />
              <h3 className="font-bold">기본 정보</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-xs text-gray-500">전문가(업체) 이름</Label>
                <Input name="partnerName" value={formData.partnerName} onChange={handleChange} placeholder="예: 홍길동 디자인" className="mt-1 h-12 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs text-gray-500">전문가 연락처</Label>
                <Input name="partnerPhone" value={formData.partnerPhone} onChange={handleChange} placeholder="010-0000-0000" className="mt-1 h-12 rounded-xl" />
              </div>
            </div>

            <div className="mb-4">
              <Label className="text-xs text-gray-500">프로젝트 명</Label>
              <Input name="projectName" value={formData.projectName} onChange={handleChange} placeholder="예: 강남 30평 전체 리모델링" className="mt-1 h-12 rounded-xl" />
            </div>

            <div>
              <Label className="text-xs text-gray-500">시공 현장 주소</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input name="location" value={formData.location} onChange={handleChange} placeholder="주소를 입력하세요" className="pl-10 h-12 rounded-xl" />
              </div>
            </div>
          </Card>

          {/* 2. 일정 정보 */}
          <Card className="p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-blue-600">
              <Calendar className="w-5 h-5" />
              <h3 className="font-bold">공사 일정</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">착공일</Label>
                <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 h-12 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs text-gray-500">준공 예정일</Label>
                <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 h-12 rounded-xl" />
              </div>
            </div>
          </Card>

          {/* 3. 대금 지급 (핵심) */}
          <Card className="p-5 rounded-2xl shadow-sm border-blue-200 border-2 bg-gradient-to-br from-blue-50/50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Shield className="w-5 h-5" />
                <h3 className="font-bold">대금 지급 (에스크로)</h3>
              </div>
              <Badge className="bg-green-100 text-green-700 border-none">안전결제 적용</Badge>
            </div>

            <div className="mb-5">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-gray-500">총 공사 금액</Label>
                <button
                  type="button"
                  onClick={() => autoCalculate(parseIntSafe(formData.totalAmount))}
                  className="text-xs flex items-center gap-1 text-gray-500 hover:text-blue-600 font-medium transition"
                >
                  <Calculator className="w-3 h-3" /> 자동 비율 계산 (3:4:3)
                </button>
              </div>
              <div className="relative mt-1">
                <Input name="totalAmount" value={formatMoney(formData.totalAmount)} onChange={handleChange} placeholder="0" className="text-right h-14 rounded-xl text-xl font-bold pr-10" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">원</span>
              </div>
            </div>

            {/* 단계별 지급 */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border">
                <p className="text-[10px] text-gray-400 mb-1">계약금 (선)</p>
                <div className="relative">
                  <Input name="depositAmount" value={formatMoney(formData.depositAmount)} onChange={handleChange} className="text-center h-10 rounded-lg text-sm font-semibold pr-6" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">원</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border">
                <p className="text-[10px] text-gray-400 mb-1">중도금</p>
                <div className="relative">
                  <Input name="midAmount" value={formatMoney(formData.midAmount)} onChange={handleChange} className="text-center h-10 rounded-lg text-sm font-semibold pr-6" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">원</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border">
                <p className="text-[10px] text-gray-400 mb-1">잔금 (완료)</p>
                <div className="relative">
                  <Input name="finalAmount" value={formatMoney(formData.finalAmount)} onChange={handleChange} className="text-center h-10 rounded-lg text-sm font-semibold pr-6" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">원</span>
                </div>
              </div>
            </div>

            {/* 검증 메시지 */}
            <div className={`mt-4 text-xs flex items-center gap-1 ${sumMoney() === parseIntSafe(formData.totalAmount) ? 'text-green-600' : 'text-red-500'}`}>
              {sumMoney() === parseIntSafe(formData.totalAmount) ? (
                <><CheckCircle2 className="w-4 h-4" /> 금액이 정확히 일치합니다.</>
              ) : (
                <>합계가 {formatMoney(parseIntSafe(formData.totalAmount) - sumMoney())}원 차이납니다.</>
              )}
            </div>
          </Card>

          {/* 4. 특약 사항 */}
          <Card className="p-5 rounded-2xl shadow-sm">
            <Label className="text-xs text-gray-500">특약 및 요청사항</Label>
            <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="시공 관련 요청사항을 적어주세요." className="mt-1 min-h-[100px] rounded-xl" />
          </Card>

          {/* 하단 고정 버튼 */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-20">
            <div className="max-w-2xl mx-auto">
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full h-14 rounded-2xl text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                {submitting ? "계약 생성 중..." : "작성 완료 및 결제하기"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* 미리보기 모달 */}
      {showPreview && (
        <ContractPreview
          contract={{
            projectName: formData.projectName,
            partnerName: formData.partnerName,
            partnerPhone: formData.partnerPhone,
            userName: user?.user_metadata?.name || "고객",
            location: formData.location,
            startDate: formData.startDate,
            endDate: formData.endDate,
            description: formData.description,
            totalAmount: parseIntSafe(formData.totalAmount),
            depositAmount: parseIntSafe(formData.depositAmount),
            midAmount: parseIntSafe(formData.midAmount),
            finalAmount: parseIntSafe(formData.finalAmount),
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
