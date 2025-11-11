import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Send, Upload, X, Sparkles, CheckCircle, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/imageCompression";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";

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
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiEstimate, setAiEstimate] = useState<any>(null);
  
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

  const downloadPDF = () => {
    if (!aiEstimate) return;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // 제목
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI 자동 견적서', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // 프로젝트 정보
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`프로젝트: ${aiEstimate.estimateRequest.project_name}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`카테고리: ${aiEstimate.estimateRequest.category}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`위치: ${aiEstimate.estimateRequest.location}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`면적: ${aiEstimate.estimateRequest.area}평`, margin, yPosition);
      yPosition += 7;
      pdf.text(`의뢰인: ${aiEstimate.estimateRequest.client_name}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`연락처: ${aiEstimate.estimateRequest.phone}`, margin, yPosition);
      yPosition += 12;

      // 총 금액
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`총 예상 금액: ${aiEstimate.estimate.total_amount.toLocaleString()}원`, margin, yPosition);
      yPosition += 7;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`예상 작업 기간: ${aiEstimate.estimate.duration_days}일`, margin, yPosition);
      yPosition += 12;

      // 항목별 비용
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('항목별 비용', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      aiEstimate.estimate.items.forEach((item: any) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.text(`- ${item.name}${item.category ? ` [${item.category}]` : ''}`, margin + 2, yPosition);
        pdf.text(`${item.amount.toLocaleString()}원`, pageWidth - margin - 35, yPosition);
        yPosition += 5;
        
        if (item.description) {
          pdf.setFontSize(9);
          pdf.setTextColor(100);
          const descLines = pdf.splitTextToSize(`  ${item.description}`, pageWidth - margin * 2 - 5);
          descLines.forEach((line: string) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin + 4, yPosition);
            yPosition += 4;
          });
          pdf.setFontSize(10);
          pdf.setTextColor(0);
        }
      });
      yPosition += 8;

      // 작업 일정
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('작업 일정', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      aiEstimate.estimate.schedule.forEach((stage: any) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${stage.stage} (${stage.duration})`, margin + 2, yPosition);
        yPosition += 5;
        
        pdf.setFont('helvetica', 'normal');
        const taskLines = pdf.splitTextToSize(stage.tasks, pageWidth - margin * 2 - 5);
        taskLines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin + 4, yPosition);
          yPosition += 4;
        });
        yPosition += 3;
      });
      yPosition += 8;

      // 추천 파트너
      if (aiEstimate.recommendedPartner) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('추천 파트너', margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`업체명: ${aiEstimate.recommendedPartner.business_name}`, margin + 2, yPosition);
        yPosition += 5;
        pdf.text(`카테고리: ${aiEstimate.recommendedPartner.category}`, margin + 2, yPosition);
        yPosition += 5;
        
        if (aiEstimate.recommendedPartner.description) {
          const descLines = pdf.splitTextToSize(aiEstimate.recommendedPartner.description, pageWidth - margin * 2 - 5);
          descLines.forEach((line: string) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin + 2, yPosition);
            yPosition += 4;
          });
        }
        yPosition += 8;
      }

      // 추천사항
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('추천사항 및 주의사항', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const recLines = pdf.splitTextToSize(aiEstimate.estimate.recommendations, pageWidth - margin * 2);
      recLines.forEach((line: string) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 4;
      });

      // 저장
      const fileName = `견적서_${aiEstimate.estimateRequest.project_name}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF 다운로드 완료",
        description: "견적서가 PDF로 저장되었습니다",
      });
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      toast({
        title: "PDF 생성 실패",
        description: "PDF 생성 중 오류가 발생했습니다",
        variant: "destructive",
      });
    }
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

      // AI 자동 견적 생성
      const { data: estimateData } = await supabase
        .from("estimate_requests")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (estimateData) {
        setGeneratingAI(true);
        
        try {
          const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-estimate', {
            body: { estimateRequestId: estimateData.id }
          });

          if (aiError) throw aiError;

          if (aiData.success) {
            setAiEstimate(aiData);
            toast({
              title: "AI 견적서 생성 완료!",
              description: "자동으로 생성된 견적서를 확인하세요",
            });
          }
        } catch (aiError) {
          console.error("AI 견적 생성 오류:", aiError);
          toast({
            title: "AI 견적 생성 실패",
            description: "관리자가 수동으로 견적서를 발송해드립니다",
            variant: "destructive",
          });
        } finally {
          setGeneratingAI(false);
        }
      }

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
    <div className="space-y-6">
      {/* AI 견적서 결과 */}
      {aiEstimate && (
        <Card className="border-primary bg-primary/5 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">AI 자동 견적서</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadPDF}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF 다운로드
                </Button>
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  생성 완료
                </Badge>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="font-semibold text-xl mb-2">
                  {aiEstimate.estimateRequest.project_name}
                </p>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{aiEstimate.estimateRequest.category}</Badge>
                  <Badge variant="outline">{aiEstimate.estimateRequest.area}평</Badge>
                  <Badge variant="outline">{aiEstimate.estimateRequest.location}</Badge>
                </div>
              </div>

              <div className="bg-background p-6 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">총 예상 금액</p>
                  <p className="text-4xl font-bold text-primary">
                    {aiEstimate.estimate.total_amount.toLocaleString()}원
                  </p>
                  <p className="text-sm text-muted-foreground">
                    예상 작업 기간: <span className="font-semibold">{aiEstimate.estimate.duration_days}일</span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">항목별 비용</h3>
                <div className="space-y-2">
                  {aiEstimate.estimate.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-start p-3 bg-background rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{item.name}</p>
                          {item.category && (
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                      <p className="font-semibold text-lg ml-4">{item.amount.toLocaleString()}원</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">작업 일정</h3>
                <div className="space-y-3">
                  {aiEstimate.estimate.schedule.map((stage: any, idx: number) => (
                    <div key={idx} className="p-4 bg-background rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-base">{stage.stage}</p>
                        <Badge variant="secondary">{stage.duration}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{stage.tasks}</p>
                    </div>
                  ))}
                </div>
              </div>

              {aiEstimate.recommendedPartner && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">추천 파트너</h3>
                  <div className="p-4 bg-background rounded-lg border-2 border-primary/20">
                    <p className="font-semibold text-lg">{aiEstimate.recommendedPartner.business_name}</p>
                    <Badge variant="outline" className="mt-2">{aiEstimate.recommendedPartner.category}</Badge>
                    {aiEstimate.recommendedPartner.description && (
                      <p className="text-sm text-muted-foreground mt-2">{aiEstimate.recommendedPartner.description}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg mb-3">추천사항 및 주의사항</h3>
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {aiEstimate.estimate.recommendations}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  견적서에 문의사항이 있으시면 <span className="font-semibold">{aiEstimate.estimateRequest.phone}</span>로 연락주시기 바랍니다.
                </p>
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={() => navigate("/contract-create", { state: { estimateData: aiEstimate } })}
                    className="gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    이 견적으로 계약서 작성하기
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI 견적 생성 중 */}
      {generatingAI && (
        <Card className="border-primary">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">AI가 견적서를 생성하고 있습니다</h3>
            <p className="text-muted-foreground">잠시만 기다려주세요...</p>
          </CardContent>
        </Card>
      )}

      {/* 견적 신청 폼 */}
      <form onSubmit={handleSubmit}>
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calculator className="w-6 h-6" />
              AI 자동 견적 신청
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              정보를 입력하시면 AI가 자동으로 견적서를 생성해드립니다
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
              disabled={loading || compressing || generatingAI}
              className="min-w-[200px] gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {loading ? "신청 중..." : "AI 견적서 받기"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
    </div>
  );
}