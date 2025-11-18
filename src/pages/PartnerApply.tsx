import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { partners } from "@/services/api";
import { Briefcase, Star, CheckCircle2 } from "lucide-react";

export default function PartnerApply() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    phone: "",
    email: "",
    city: "",
    category: "",
    experience: "",
    license: "",
    portfolio: "",
    introduction: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await partners.apply(formData);
      
      toast({
        title: "신청 완료",
        description: "파트너 신청이 접수되었습니다. 검토 후 연락드리겠습니다.",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "신청에 실패했습니다",
        variant: "destructive",
      });
    }
  };

  const categories = [
    "화이트톤",
    "우드 포인트",
    "모던 주방",
    "라이트 그레이",
    "내추럴 베이지",
    "산뜻한 현관",
    "미니멀",
    "북유럽 스타일",
    "럭셔리",
  ];

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-3 sm:p-4">
      <div className="container mx-auto max-w-4xl py-4 sm:py-6 md:py-8">
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

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>신청서 작성</CardTitle>
            <CardDescription>
              모든 정보를 정확하게 입력해주세요. 검토 후 2-3일 내 연락드립니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  기본 정보
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">업체명 / 상호 *</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      placeholder="새로고침 인테리어"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">대표자명 *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="홍길동"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">연락처 *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="010-1234-5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일 *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="partner@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* 사업 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  사업 정보
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">주요 활동 지역 *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="서울, 경기 등"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">전문 분야 *</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">경력 (년) *</Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      value={formData.experience}
                      onChange={handleChange}
                      required
                      placeholder="5"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license">사업자등록번호 *</Label>
                    <Input
                      id="license"
                      name="license"
                      value={formData.license}
                      onChange={handleChange}
                      required
                      placeholder="123-45-67890"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio">포트폴리오 URL</Label>
                  <Input
                    id="portfolio"
                    name="portfolio"
                    type="url"
                    value={formData.portfolio}
                    onChange={handleChange}
                    placeholder="https://example.com/portfolio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="introduction">자기소개 *</Label>
                  <Textarea
                    id="introduction"
                    name="introduction"
                    value={formData.introduction}
                    onChange={handleChange}
                    required
                    placeholder="본인의 강점과 주요 작업 스타일을 소개해주세요"
                    className="min-h-[120px]"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  신청하시면 개인정보 수집 및 이용에 동의하는 것으로 간주됩니다.
                  수집된 정보는 파트너 심사 및 관리 목적으로만 사용됩니다.
                </p>
              </div>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                파트너 신청하기
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
