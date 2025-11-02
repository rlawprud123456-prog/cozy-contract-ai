import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface CommunityPostFormProps {
  category: string;
  onSuccess: () => void;
}

export default function CommunityPostForm({ category, onSuccess }: CommunityPostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages].slice(0, 5)); // 최대 5개
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "글을 작성하려면 로그인이 필요합니다",
          variant: "destructive",
        });
        return;
      }

      // 이미지 업로드
      const imageUrls: string[] = [];
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('community-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('community-images')
          .getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }

      // 게시글 생성
      const { error: insertError } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          category,
          title: title.trim(),
          content: content.trim(),
          images: imageUrls,
        });

      if (insertError) throw insertError;

      toast({
        title: "작성 완료",
        description: "게시글이 성공적으로 작성되었습니다",
      });

      setTitle("");
      setContent("");
      setImages([]);
      onSuccess();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "오류 발생",
        description: error.message || "게시글 작성 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg p-6 border border-border">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="content">내용</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={6}
            maxLength={2000}
          />
        </div>

        <div>
          <Label htmlFor="images">이미지 (최대 5개)</Label>
          <div className="mt-2">
            <label htmlFor="images" className="cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Upload className="w-5 h-5" />
                  <span>이미지 선택</span>
                </div>
              </div>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                disabled={images.length >= 5}
              />
            </label>
          </div>

          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" disabled={uploading} className="w-full">
          {uploading ? "작성 중..." : "작성하기"}
        </Button>
      </div>
    </form>
  );
}
