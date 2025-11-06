import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Send, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/imageCompression";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { value: "full", label: "전체 리모델링" },
  { value: "partial", label: "부분 리모델링" },
  { value: "bathroom", label: "욕실" },
  { value: "kitchen", label: "주방" },
  { value: "floor", label: "바닥" },
  { value: "wallpaper", label: "도배/도장" },
  { value: "window", label: "창호" },
  { value: "lighting", label: "조명/전기" },
  { value: "furniture", label: "가구/수납" },
  { value: "cafe", label: "카페" },
  { value: "restaurant", label: "식당" },
  { value: "office", label: "사무실" },
  { value: "retail", label: "매장" },
];

export default function EstimateRequestForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  
  const [formData, setFormData] = useState({
    projectName: "",
    clientName: "",
    phone: "",
    location: "",
    category: "",
    area: "",
    estimatedBudget: "",
    description: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 5) {
      toast({
        title: "이미지 개수 초과",
        description: "최대 5개까지 업로드 가능합니다",
        variant: "destructive",
      });
      return;
    }

    setCompressing(true);
    try {
      const compressedFiles: File[] = [];
      const newPreviews: string[] = [];

      for (const file of files) {
        const compressed = await compressImage(file);
        compressedFiles.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      }

      setImages((prev) => [...prev, ...compressedFiles]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);

      toast({
        title: "이미지 추가 완료",
        description: `${files.length}개의 이미지가 추가되었습니다`,
      });
    } catch (error) {
      toast({
        title: "이미지 압축 실패",
        description: "이미지 처리 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setCompressing(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.projectName || !formData.clientName || !formData.phone || 
        !formData.location || !formData.category || !formData.area) {
      toast({
        title: "필수 항목 확인",
        description: "모든 필수 항목을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "견적 신청을 위해 로그인이 필요합니다",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // 이미지 업로드
      const imageUrls: string[] = [];
      if (images.length > 0) {
        for (const image of images) {
          const fileName = `${user.id}/${Date.now()}_${image.name}`;
          const { data, error } = await supabase.storage
            .from("community-images")
            .upload(fileName, image);

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from("community-images")
            .getPublicUrl(data.path);

          imageUrls.push(publicUrl);
        }
      }

      // 견적 신청 저장
      const { error } = await supabase.from("estimate_requests").insert({
        user_id: user.id,
        project_name: formData.projectName,
        client_name: formData.clientName,
        phone: formData.phone,
        location: formData.location,
        category: formData.category,
        area: parseFloat(formData.area),
        estimated_budget: formData.estimatedBudget ? parseInt(formData.estimatedBudget) : null,
        description: formData.description || null,
        images: imageUrls,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "견적 신청 완료!",
        description: "전문가가 확인 후 연락드리겠습니다",
      });

      // 폼 초기화
      setFormData({
        projectName: "",
        clientName: "",
        phone: "",
        location: "",
        category: "",
        area: "",
        estimatedBudget: "",
        description: "",
      });
      setImages([]);
      setImagePreviews([]);

    } catch (error) {
      console.error("견적 신청 오류:", error);
      toast({
        title: "신청 실패",
        description: "견적 신청 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            견적 신청
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            인테리어 견적을 신청하시면 전문가가 확인 후 연락드립니다
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 프로젝트 정보 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">프로젝트 정보</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">프로젝트명 *</Label>
                <Input
                  id="projectName"
                  placeholder="예: 강남구 아파트 32평 리모델링"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange("projectName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">공사 종류 *</Label>
                <select
                  id="category"
                  className="w-full border border-input bg-background rounded-md h-10 px-3 text-sm"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  required
                >
                  <option value="">선택하세요</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">시공 위치 *</Label>
              <Input
                id="location"
                placeholder="예: 서울시 강남구 테헤란로 123"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">면적 (평) *</Label>
                <Input
                  id="area"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="예: 32"
                  value={formData.area}
                  onChange={(e) => handleInputChange("area", e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">1평 ≈ 3.3㎡</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedBudget">예상 금액 (원)</Label>
                <Input
                  id="estimatedBudget"
                  type="number"
                  step="1000000"
                  min="0"
                  placeholder="예: 30000000"
                  value={formData.estimatedBudget}
                  onChange={(e) => handleInputChange("estimatedBudget", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">선택 사항입니다</p>
              </div>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">연락처 정보</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">이름 *</Label>
                <Input
                  id="clientName"
                  placeholder="홍길동"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">연락처 *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* 상세 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">상세 설명</Label>
            <Textarea
              id="description"
              placeholder="공사 내용, 원하시는 스타일, 특별히 신경쓰고 싶은 부분 등을 자유롭게 작성해주세요"
              rows={5}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>

          {/* 이미지 업로드 */}
          <div className="space-y-3">
            <Label>현장 사진 (선택, 최대 5장)</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image-upload")?.click()}
                disabled={compressing || images.length >= 5}
              >
                <Upload className="w-4 h-4 mr-2" />
                {compressing ? "압축 중..." : "사진 선택"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {images.length}/5
              </span>
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* 이미지 미리보기 */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`미리보기 ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={loading || compressing}
              className="min-w-[200px]"
            >
              <Send className="w-5 h-5 mr-2" />
              {loading ? "신청 중..." : "견적 신청하기"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}