import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createContract } from "@/services/contract";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Shield, Eye } from "lucide-react";
import ContractPreview from "@/components/ContractPreview";
import { AppPage } from "@/components/layout/AppPage";
import { SectionCard } from "@/components/layout/SectionCard";

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

  // AI 견적서에서 전달된 데이터로 폼 초기화
  useEffect(() => {
    const estimateData = location.state?.estimateData;
    if (estimateData) {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() + 3); // 3일 후 시작
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (estimateData.estimate?.duration_days || 30));

      setFormData({
        partnerName: estimateData.recommendedPartner?.business_name || "",
        partnerPhone: "",
        projectName: estimateData.estimateRequest?.project_name || "",
        location: estimateData.estimateRequest?.location || "",
        totalAmount: String(estimateData.estimate?.total_amount || ""),
        depositAmount: String(Math.floor((estimateData.estimate?.total_amount || 0) * 0.3)),
        midAmount: String(Math.floor((estimateData.estimate?.total_amount || 0) * 0.4)),
        finalAmount: String(Math.floor((estimateData.estimate?.total_amount || 0) * 0.3)),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        description: estimateData.estimate?.recommendations || "",
      });

      toast({
        title: "AI 견적서 불러오기 완료",
        description: "견적 정보가 자동으로 입력되었습니다. 필요시 수정해주세요.",
      });
    }
  }, [location.state]);

  // 숫자 안전 파싱/합계 유틸
  const parseIntSafe = (v: string) => Number(v || 0);
  const sumMoney = () =>
    parseIntSafe(formData.depositAmount) +
    parseIntSafe(formData.midAmount) +
    parseIntSafe(formData.finalAmount);

  // 표시용 포맷
  const formatMoney = (value: string | number) => {
    const n = typeof value === "string" ? Number(value || 0) : value;
    if (!n) return "0";
    return n.toLocaleString("ko-KR");
  };

  // 인풋 변경
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as { name: string; value: string };
    const moneyFields = ["totalAmount", "depositAmount", "midAmount", "finalAmount"];

    if (moneyFields.includes(name)) {
      // 금액: 숫자만
      const sanitized = value.replace(/[^\d]/g, "");
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      return;
    }

    if (name === "partnerPhone") {
      // 휴대폰 자동 하이픈 + 최대 11자리
      const digits = value.replace(/\D/g, "").slice(0, 11);
      let formatted = digits;

      if (digits.startsWith("02")) {
        if (digits.length > 2 && digits.length <= 6) {
          formatted = digits.replace(/(\d{2})(\d+)/, "$1-$2");
        } else if (digits.length > 6) {
          formatted = digits.replace(/(\d{2})(\d{3,4})(\d{0,4})/, "$1-$2-$3").replace(/-$/, "");
        }
      } else {
        if (digits.length > 3 && digits.length <= 7) {
          formatted = digits.replace(/(\d{3})(\d+)/, "$1-$2");
        } else if (digits.length > 7) {
          formatted = digits.replace(/(\d{3})(\d{3,4})(\d{0,4})/, "$1-$2-$3").replace(/-$/, "");
        }
      }
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 숫자 인풋 휠/이상키 방지
  const preventWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).blur();
  };
  const blockWeirdKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
  };

  // 공통 검증
  const validateCommon = () => {
    // 필수
    if (!formData.projectName || !formData.partnerName || !formData.totalAmount) {
      toast({
        title: "필수 항목 누락",
        description: "프로젝트명, 전문가 이름, 총 계약금액은 필수입니다",
        variant: "destructive",
      });
      return false;
    }

    // 총액 최소 10만원
    const total = parseIntSafe(formData.totalAmount);
    if (total < 100000) {
      toast({
        title: "금액 확인",
        description: "총 계약금액은 최소 10만원 이상이어야 합니다",
        variant: "destructive",
      });
      return false;
    }

    // 날짜 검증
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (start > end) {
        toast({
          title: "기간 확인",
          description: "완료 예정일이 시작일보다 빠를 수 없습니다",
          variant: "destructive",
        });
        return false;
      }

      // 시작일 과거 금지
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      if (start < today) {
        toast({
          title: "시작일 확인",
          description: "시작일은 오늘 이후여야 합니다",
          variant: "destructive",
        });
        return false;
      }
    }

    // 합계 일치
    const partial = sumMoney();
    if (total !== partial) {
      toast({
        title: "금액 합계 불일치",
        description: `선금+중도금+잔금(${partial.toLocaleString()}원)의 합이 총 계약금액(${total.toLocaleString()}원)과 일치해야 합니다`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handlePreview = () => {
    if (!validateCommon()) return;
    setShowPreview(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 인증 확인
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      toast({
        title: "로그인 필요",
        description: "계약 생성을 위해 로그인해주세요",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // 휴대폰 형식 체크
    const phone = (formData.partnerPhone || "").trim();
    const phoneOk = /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone) || /^02-?\d{3,4}-?\d{4}$/.test(phone);
    if (!phoneOk) {
      toast({
        title: "연락처 형식 오류",
        description: "올바른 전화번호를 입력하세요 (예: 010-1234-5678)",
        variant: "destructive",
      });
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
        description: formData.description || undefined,
      });

      toast({
        title: "계약 생성 완료",
        description: "에스크로 결제 페이지로 이동합니다",
      });

      navigate("/escrow");
    } catch (error) {
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "계약 생성에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppPage
      title="안전한 인테리어 계약"
      description="에스크로 결제로 안전하게 보호되는 계약을 시작하세요"
      icon={<FileText className="w-6 h-6 text-accent" />}
      maxWidth="lg"
    >
      <SectionCard
        title="계약서 작성"
        description="모든 정보를 정확하게 입력해주세요. 계약 완료 후 에스크로 결제가 진행됩니다."
        headerRight={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePreview}
            disabled={submitting}
          >
            <Eye className="w-4 h-4 mr-1" />
            미리보기
          </Button>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* 파트너 정보 */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground border-b pb-2">
                  전문가 정보
                </h3>
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="partnerName" className="text-sm">전문가 이름 *</Label>
                    <Input
                      id="partnerName"
                      name="partnerName"
                      value={formData.partnerName}
                      onChange={handleChange}
                      required
                      placeholder="홍길동"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerPhone" className="text-sm">연락처 *</Label>
                    <Input
                      id="partnerPhone"
                      name="partnerPhone"
                      value={formData.partnerPhone}
                      onChange={handleChange}
                      required
                      maxLength={13}
                      placeholder="010-1234-5678"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 프로젝트 정보 */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground border-b pb-2">
                  프로젝트 정보
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName" className="text-sm">프로젝트명 *</Label>
                    <Input
                      id="projectName"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleChange}
                      required
                      placeholder="거실 및 주방 리모델링"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm">시공 장소 *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="서울시 강남구 테헤란로 123"
                      className="text-sm"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">시작일 *</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">완료 예정일 *</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">프로젝트 설명</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="프로젝트의 세부 내용을 작성해주세요"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              {/* 결제 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  에스크로 결제 정보
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalAmount">총 계약 금액 (원) *</Label>
                    <Input
                      id="totalAmount"
                      name="totalAmount"
                      type="number"
                      value={formData.totalAmount}
                      onChange={handleChange}
                      required
                      min={100000}
                      step={10000}
                      inputMode="numeric"
                      onWheel={preventWheel}
                      onKeyDown={blockWeirdKeys}
                      placeholder="10000000"
                    />
                    {formData.totalAmount && (
                      <p className="text-sm text-muted-foreground">
                        {formatMoney(formData.totalAmount)}원
                      </p>
                    )}
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="depositAmount">선금 (원) *</Label>
                      <Input
                        id="depositAmount"
                        name="depositAmount"
                        type="number"
                        value={formData.depositAmount}
                        onChange={handleChange}
                        required
                        min={0}
                        step={10000}
                        inputMode="numeric"
                        onWheel={preventWheel}
                        onKeyDown={blockWeirdKeys}
                        placeholder="3000000"
                      />
                      {formData.depositAmount && (
                        <p className="text-xs text-muted-foreground">
                          {formatMoney(formData.depositAmount)}원
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="midAmount">중도금 (원) *</Label>
                      <Input
                        id="midAmount"
                        name="midAmount"
                        type="number"
                        value={formData.midAmount}
                        onChange={handleChange}
                        required
                        min={0}
                        step={10000}
                        inputMode="numeric"
                        onWheel={preventWheel}
                        onKeyDown={blockWeirdKeys}
                        placeholder="4000000"
                      />
                      {formData.midAmount && (
                        <p className="text-xs text-muted-foreground">
                          {formatMoney(formData.midAmount)}원
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="finalAmount">잔금 (원) *</Label>
                      <Input
                        id="finalAmount"
                        name="finalAmount"
                        type="number"
                        value={formData.finalAmount}
                        onChange={handleChange}
                        required
                        min={0}
                        step={10000}
                        inputMode="numeric"
                        onWheel={preventWheel}
                        onKeyDown={blockWeirdKeys}
                        placeholder="3000000"
                      />
                      {formData.finalAmount && (
                        <p className="text-xs text-muted-foreground">
                          {formatMoney(formData.finalAmount)}원
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 합계 표시 */}
                  {(formData.depositAmount || formData.midAmount || formData.finalAmount) && (
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>합계:</span>
                        <span className="font-semibold">
                          {formatMoney(sumMoney())}원
                        </span>
                      </div>
                      {formData.totalAmount && (
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>총 계약금액:</span>
                          <span>{formatMoney(formData.totalAmount)}원</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 inline mr-1 text-accent" />
                      에스크로 결제로 안전하게 보호됩니다. 각 단계별 작업 확인 후 전문가에게 대금이 지급됩니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-accent hover:bg-accent/90"
                  disabled={submitting}
                >
                  {submitting ? "처리 중..." : "계약 생성 및 에스크로 진행"}
                </Button>
              </div>
            </form>
          </SectionCard>

          {/* 미리보기 모달 */}
          {showPreview && (
            <ContractPreview
              contract={{
                projectName: formData.projectName,
                partnerName: formData.partnerName,
                partnerPhone: formData.partnerPhone,
                userName: "고객",
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
        </AppPage>
      );
    }
