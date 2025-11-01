import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { contractManagement } from "@/services/api";
import { FileText, Shield } from "lucide-react";

interface ContractCreateProps {
  user: any;
}

export default function ContractCreate({ user }: ContractCreateProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "로그인 필요",
        description: "계약 생성을 위해 로그인해주세요",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      const contract = {
        ...formData,
        userId: user.id,
        userName: user.name,
        totalAmount: Number(formData.totalAmount),
        depositAmount: Number(formData.depositAmount),
        midAmount: Number(formData.midAmount),
        finalAmount: Number(formData.finalAmount),
      };

      await contractManagement.create(contract);
      
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
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <FileText className="w-8 h-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              안전한 인테리어 계약
            </h1>
          </div>
          <p className="text-muted-foreground">
            에스크로 결제로 안전하게 보호되는 계약을 시작하세요
          </p>
        </div>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              계약서 작성
            </CardTitle>
            <CardDescription>
              모든 정보를 정확하게 입력해주세요. 계약 완료 후 에스크로 결제가 진행됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 파트너 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  전문가 정보
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="partnerName">전문가 이름 *</Label>
                    <Input
                      id="partnerName"
                      name="partnerName"
                      value={formData.partnerName}
                      onChange={handleChange}
                      required
                      placeholder="홍길동"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerPhone">연락처 *</Label>
                    <Input
                      id="partnerPhone"
                      name="partnerPhone"
                      value={formData.partnerPhone}
                      onChange={handleChange}
                      required
                      placeholder="010-1234-5678"
                    />
                  </div>
                </div>
              </div>

              {/* 프로젝트 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  프로젝트 정보
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">프로젝트명 *</Label>
                    <Input
                      id="projectName"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleChange}
                      required
                      placeholder="거실 및 주방 리모델링"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">시공 장소 *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="서울시 강남구 테헤란로 123"
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
                      placeholder="10000000"
                    />
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
                        placeholder="3000000"
                      />
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
                        placeholder="4000000"
                      />
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
                        placeholder="3000000"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 inline mr-1 text-accent" />
                      에스크로 결제로 안전하게 보호됩니다. 각 단계별 작업 확인 후 전문가에게 대금이 지급됩니다.
                    </p>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                계약 생성 및 에스크로 진행
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
