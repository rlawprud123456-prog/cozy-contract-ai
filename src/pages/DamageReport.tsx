import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Upload, X } from "lucide-react";

export default function DamageReport() {
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessLicense, setBusinessLicense] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedImages.length + files.length > 5) {
      toast({
        title: "이미지 제한",
        description: "최대 5개의 이미지만 업로드할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

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

    try {
      // 이미지 업로드
      const imageUrls: string[] = [];
      for (const file of selectedImages) {
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError, data } = await supabase.storage
          .from("community-images")
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("community-images")
          .getPublicUrl(fileName);
        
        imageUrls.push(publicUrl);
      }

      // 피해신고 등록
      const { error: reportError } = await supabase
        .from("damage_reports")
        .insert({
          user_id: user.id,
          business_name: businessName.trim(),
          phone: phone.trim() || null,
          business_license: businessLicense.trim() || null,
          amount: amount ? parseInt(amount) : null,
          description: description.trim() || null,
          images: imageUrls,
        });

      if (reportError) {
        throw reportError;
      }

      // 커뮤니티 "속상해요"에도 자동 등록
      const communityTitle = `${businessName} 피해신고`;
      const communityContent = `업체명: ${businessName}\n` +
        (phone ? `전화번호: ${phone}\n` : '') +
        (businessLicense ? `사업자등록번호: ${businessLicense}\n` : '') +
        (amount ? `피해금액: ${parseInt(amount).toLocaleString()}원\n` : '') +
        `\n${description || ''}`;

      const { error: communityError } = await supabase
        .from("community_posts")
        .insert({
          user_id: user.id,
          category: "sad",
          title: communityTitle,
          content: communityContent,
          images: imageUrls,
        });

      if (communityError) {
        console.error("커뮤니티 등록 오류:", communityError);
      }

      toast({
        title: "신고 완료",
        description: "피해신고가 성공적으로 등록되었습니다. 커뮤니티에도 공유되었습니다.",
      });

      // 폼 초기화
      setBusinessName("");
      setPhone("");
      setBusinessLicense("");
      setAmount("");
      setDescription("");
      setSelectedImages([]);

      // 피해이력 페이지로 이동
      navigate("/damage-history");
    } catch (error) {
      console.error("제출 오류:", error);
      toast({
        title: "신고 실패",
        description: "피해신고 등록에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background p-3 sm:p-4">
      <div className="container mx-auto max-w-2xl py-6 sm:py-8 md:py-12">
        <div className="mb-6 sm:mb-8 md:mb-10 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-destructive" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3 px-2">피해신고</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            인테리어 관련 피해를 당하셨나요? 아래 양식을 작성하여 신고해주세요.
          </p>
        </div>

        <Card className="rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-medium">
                업체명 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="businessName"
                placeholder="피해를 입힌 업체명을 입력하세요"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="h-10 sm:h-11 md:h-12 rounded-xl sm:rounded-2xl text-sm sm:text-base"
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

            <div className="space-y-2">
              <Label className="text-sm font-medium">증빙 사진 (최대 5개)</Label>
              <div className="flex flex-col gap-3">
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      클릭하여 이미지 선택 (최대 5개)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`미리보기 ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-full text-base"
              >
                {isSubmitting ? "신고 중..." : "피해신고 제출하고 커뮤니티에 공유"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
