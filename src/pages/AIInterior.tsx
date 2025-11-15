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
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">AI 인테리어</h1>
          <p className="text-muted-foreground mb-2">
            인테리어가 필요한 사진을 올리면 AI가 알아서 공간에 딱 맞는
          </p>
          <p className="text-muted-foreground">
            인테리어를 해드립니다.
          </p>
        </div>

        {/* Before/After 예시 섹션 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">나보다 나를 더 잘 아는 AI 인테리어, 지금 경험해 보세요.</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="relative">
                <img src={beforeImage} alt="Before" className="w-full h-64 object-cover" />
                <div className="absolute top-4 left-4 bg-background/90 px-4 py-2 rounded-lg">
                  <span className="font-semibold">Before</span>
                </div>
              </div>
            </Card>
            <Card className="overflow-hidden">
              <div className="relative">
                <img src={afterImage} alt="After" className="w-full h-64 object-cover" />
                <div className="absolute top-4 left-4 bg-background/90 px-4 py-2 rounded-lg">
                  <span className="font-semibold">After</span>
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <span className="bg-background/90 px-3 py-1 rounded-full text-sm">Living room</span>
                  <span className="bg-background/90 px-3 py-1 rounded-full text-sm">Bohemian</span>
                </div>
                <div className="absolute top-4 right-4 bg-primary/90 px-3 py-1 rounded-lg">
                  <span className="font-semibold text-primary-foreground">Redesign</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">이미지 업로드</h2>
            
            <div className="mb-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">*업로드 가능 이미지</p>
                  <p className="text-sm text-muted-foreground">10MB 이내 / png, jpg, jpeg</p>
                </label>
              </div>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                어떤 인테리어 스타일을 원하세요?
              </label>
              <Textarea
                placeholder="정확한 인테리어 스타일과 컨텐츠 넣으면 더 좋은결과를 얻을 수 있어요.&#10;- 화이트 컬러의 모던한 느낌의 인테리어로 꾸며줘"
                value={stylePrompt}
                onChange={(e) => setStylePrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">보유 포인트</h2>
            
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                  P
                </div>
                <span className="text-2xl font-bold">0</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="text-2xl font-bold">0</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  충전하기
                </Button>
                <Button variant="outline" className="flex-1">
                  포인트 받기
                </Button>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              disabled={loading || images.length === 0}
            >
              <Sparkles className="mr-2 h-5 w-5" />
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
