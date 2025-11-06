import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/imageCompression";

interface PostFormProps {
  category: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PostForm({ category, onSuccess, onCancel }: PostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const { toast } = useToast();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCompressing(true);
      try {
        const files = Array.from(e.target.files);
        const compressedImages: File[] = [];

        for (const file of files) {
          // 이미지 파일만 처리
          if (file.type.startsWith('image/')) {
            const compressed = await compressImage(file);
            compressedImages.push(compressed);
          } else {
            compressedImages.push(file);
          }
        }

        setImages([...images, ...compressedImages]);
        toast({
          title: "이미지 압축 완료",
          description: `${compressedImages.length}개의 이미지가 최적화되었습니다`,
        });
      } catch (error) {
        console.error("이미지 압축 실패:", error);
        toast({
          title: "이미지 처리 실패",
          description: "이미지를 처리하는 중 오류가 발생했습니다",
          variant: "destructive",
        });
      } finally {
        setCompressing(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인이 필요합니다",
          variant: "destructive",
        });
        return;
      }

      // Upload images
      const imageUrls: string[] = [];
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('community-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('community-images')
          .getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }

      // Create post
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          category,
          title,
          content,
          images: imageUrls,
        });

      if (error) throw error;

      toast({
        title: "게시글이 작성되었습니다",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "게시글 작성 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border border-border">
      <div>
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="제목을 입력하세요"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder="내용을 입력하세요"
          className="mt-2 min-h-[200px]"
        />
      </div>

      <div>
        <Label htmlFor="images">이미지 첨부</Label>
        <div className="mt-2 space-y-4">
          <div className="flex items-center gap-2">
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('images')?.click()}
              disabled={compressing}
            >
              {compressing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  압축 중...
                </>
              ) : (
                <>
                  <ImagePlus className="w-4 h-4 mr-2" />
                  이미지 선택
                </>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              {images.length}개 선택됨
            </span>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`미리보기 ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {(image.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? "작성 중..." : "작성하기"}
        </Button>
      </div>
    </form>
  );
}
