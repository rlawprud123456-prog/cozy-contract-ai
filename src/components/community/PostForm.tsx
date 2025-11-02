import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface PostFormProps {
  category: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PostForm({ category, onSuccess, onCancel }: PostFormProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

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
        description: "제목과 내용을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다");

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

      // 게시글 저장
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          category,
          title: title.trim(),
          content: content.trim(),
          images: imageUrls,
        });

      if (error) throw error;

      toast({
        title: "게시글 작성 완료",
        description: "게시글이 성공적으로 작성되었습니다",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({
        title: "작성 실패",
        description: error.message || "게시글 작성 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg p-6 space-y-4">
      <div>
        <Input
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          disabled={uploading}
        />
      </div>
      
      <div>
        <Textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          maxLength={2000}
          disabled={uploading}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
          <Upload className="w-4 h-4" />
          이미지 추가 (최대 5개)
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
            disabled={uploading || images.length >= 5}
          />
        </label>
        
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-20 h-20">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`preview ${idx}`}
                  className="w-full h-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  disabled={uploading}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={uploading}>
          {uploading ? "작성 중..." : "작성하기"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
          취소
        </Button>
      </div>
    </form>
  );
}
