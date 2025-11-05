import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import CommentSection from "@/components/community/CommentSection";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  images: string[];
  view_count: number;
  like_count: number;
  created_at: string;
  user_id: string;
  profiles?: {
    name: string;
  };
  partners?: {
    business_name: string;
    verified: boolean;
  };
}

const categoryNames: Record<string, string> = {
  sad: "속상해요",
  unfair: "억울해요",
  "diy-tips": "셀프인테리어 팁",
  jobs: "구인구직",
  help: "고수님 도와주세요",
};

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchPost();
      incrementViewCount();
    }
  }, [id]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("community_posts")
      .select(`
        *,
        profiles:user_id (name),
        partners:user_id (business_name, verified)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("게시글 로드 실패:", error);
      toast({
        title: "오류",
        description: "게시글을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
      navigate(-1);
      return;
    }

    setPost(data);
    setLoading(false);
  };

  const incrementViewCount = async () => {
    if (!id) return;
    
    const { error } = await supabase.rpc("increment_view_count", {
      post_id: id,
    });

    if (error) {
      console.error("조회수 증가 실패:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-180px)] bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          목록으로
        </Button>

        <Card className="rounded-3xl border border-border p-8">
          {/* 헤더 */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">
                {categoryNames[post.category] || post.category}
              </Badge>
              {post.partners?.verified && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  ✓ 인증업체
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium">
                {post.partners?.business_name || post.profiles?.name || "익명"}
              </span>
              <span>
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.view_count}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {post.like_count}
                </span>
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div className="mb-8">
            <p className="text-foreground whitespace-pre-line leading-relaxed">
              {post.content}
            </p>
          </div>

          {/* 이미지 */}
          {post.images && post.images.length > 0 && (
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {post.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`이미지 ${idx + 1}`}
                  className="w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}

          {/* 댓글 섹션 */}
          <div className="mt-8 pt-8 border-t">
            <CommentSection postId={post.id} />
          </div>
        </Card>
      </div>
    </div>
  );
}
