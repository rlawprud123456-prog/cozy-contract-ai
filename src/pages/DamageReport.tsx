import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

export default function DamageReport() {
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessLicense, setBusinessLicense] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 로그인 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "피해신고를 작성하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!businessName.trim()) {
      toast({
        title: "입력 오류",
        description: "업체명은 필수 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from("damage_reports")
      .insert({
        user_id: user.id,
        business_name: businessName.trim(),
        phone: phone.trim() || null,
        business_license: businessLicense.trim() || null,
        amount: amount ? parseInt(amount) : null,
        description: description.trim() || null,
      });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "신고 실패",
        description: "피해신고 등록에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "신고 완료",
      description: "피해신고가 성공적으로 등록되었습니다.",
    });

    // 폼 초기화
    setBusinessName("");
    setPhone("");
    setBusinessLicense("");
    setAmount("");
    setDescription("");

    // 피해이력 페이지로 이동
    navigate("/damage-history");
  };

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background p-4">
      <div className="container mx-auto max-w-2xl py-12">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">피해신고</h1>
          <p className="text-muted-foreground">
            인테리어 관련 피해를 당하셨나요? 아래 양식을 작성하여 신고해주세요.
          </p>
        </div>

        <Card className="rounded-3xl border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-medium">
                업체명 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="businessName"
                placeholder="피해를 입힌 업체명을 입력하세요"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="h-12 rounded-2xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">전화번호</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="예: 010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessLicense" className="text-sm font-medium">
                사업자등록번호
              </Label>
              <Input
                id="businessLicense"
                placeholder="예: 123-45-67890"
                value={businessLicense}
                onChange={(e) => setBusinessLicense(e.target.value)}
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">피해 금액 (원)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="예: 5000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                피해 내용 설명
              </Label>
              <Textarea
                id="description"
                placeholder="어떤 피해를 입으셨는지 자세히 설명해주세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[150px] rounded-2xl"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-full text-base"
              >
                {isSubmitting ? "신고 중..." : "피해신고 제출"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
