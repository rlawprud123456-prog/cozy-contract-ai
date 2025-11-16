import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import beforeImage from "@/assets/ai-interior-before.jpg";
import afterImage from "@/assets/ai-interior-after.jpg";

export default function AIInterior() {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [stylePrompt, setStylePrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast({
        title: "이미지 개수 초과",
        description: "최대 5개까지만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    setImages([...images, ...files]);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (images.length === 0) {
      toast({
        title: "이미지를 업로드해주세요",
        description: "AI 인테리어 생성을 위해 최소 1개의 이미지가 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    // TODO: AI 인테리어 생성 API 호출
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "AI 인테리어 생성 완료",
        description: "생성된 이미지를 확인해보세요!",
      });
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-3 sm:p-4">
      <div className="container mx-auto max-w-6xl py-4 sm:py-6 md:py-8">
        <div className="mb-6 sm:mb-8 text-center px-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">AI 인테리어</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-1 sm:mb-2">
            인테리어가 필요한 사진을 올리면 AI가 알아서 공간에 딱 맞는
          </p>
          <p className="text-sm sm:text-base text-muted-foreground">
            인테리어를 해드립니다.
          </p>
        </div>

        {/* Before/After 예시 섹션 */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-4 sm:mb-6 px-2">나보다 나를 더 잘 아는 AI 인테리어, 지금 경험해 보세요.</h2>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="relative">
                <img src={beforeImage} alt="Before" className="w-full h-48 sm:h-56 md:h-64 object-cover" />
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-background/90 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                  <span className="font-semibold text-sm sm:text-base">Before</span>
                </div>
              </div>
            </Card>
            <Card className="overflow-hidden">
              <div className="relative">
                <img src={afterImage} alt="After" className="w-full h-48 sm:h-56 md:h-64 object-cover" />
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-background/90 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                  <span className="font-semibold text-sm sm:text-base">After</span>
                </div>
                <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
                  <span className="bg-background/90 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm">Living room</span>
                  <span className="bg-background/90 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm">Bohemian</span>
                </div>
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-primary/90 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg">
                  <span className="font-semibold text-primary-foreground">Redesign</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">이미지 업로드</h2>
            
            <div className="mb-3 sm:mb-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs sm:text-sm text-muted-foreground">*업로드 가능 이미지</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">10MB 이내 / png, jpg, jpeg</p>
                </label>
              </div>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 sm:h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 sm:top-2 right-1 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      onClick={() => removeImage(index)}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium mb-2">
                어떤 인테리어 스타일을 원하세요?
              </label>
              <Textarea
                placeholder="정확한 인테리어 스타일과 컨텐츠 넣으면 더 좋은결과를 얻을 수 있어요.&#10;- 화이트 컬러의 모던한 느낌의 인테리어로 꾸며줘"
                value={stylePrompt}
                onChange={(e) => setStylePrompt(e.target.value)}
                className="min-h-[80px] sm:min-h-[100px] text-sm"
              />
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">보유 포인트</h2>
            
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  P
                </div>
                <span className="text-xl sm:text-2xl font-bold">0</span>
              </div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  A
                </div>
                <span className="text-xl sm:text-2xl font-bold">0</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-xs sm:text-sm">
                  충전하기
                </Button>
                <Button variant="outline" className="flex-1 text-xs sm:text-sm">
                  포인트 받기
                </Button>
              </div>
            </div>

            <Button
              className="w-full text-sm sm:text-base"
              size="lg"
              onClick={handleGenerate}
              disabled={loading || images.length === 0}
            >
              <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              생성하기 / 💰 20
            </Button>

            <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm font-medium mb-2">
                어떤 인테리어 스타일을 원하세요?
              </p>
              <p className="text-sm text-muted-foreground">
                정확한 인테리어 스타일과 컨텐츠 넣으면 더 좋은결과를 얻을 수 있어요.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                - 화이트 컬러의 모던한 느낌의 인테리어로 꾸며줘
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
