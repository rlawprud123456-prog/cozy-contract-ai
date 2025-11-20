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
  user_name?: string;
  business_name?: string;
  verified?: boolean;
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
      .select("*")
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

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", data.user_id)
      .single();

    // Fetch partner info if exists
    const { data: partner } = await supabase
      .from("partners")
      .select("business_name, verified")
      .eq("user_id", data.user_id)
      .single();

    setPost({
      ...data,
      user_name: profile?.name,
      business_name: partner?.business_name,
      verified: partner?.verified,
    });
    setLoading(false);
  };

  const incrementViewCount = async () => {
    if (!id) return;
    
    await supabase
      .from("community_posts")
      .update({ view_count: (post?.view_count || 0) + 1 })
      .eq("id", id);
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
    <div className="min-h-[calc(100vh-180px)] bg-background p-3 sm:p-4">
      <div className="container mx-auto max-w-4xl py-4 sm:py-6 md:py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-3 sm:mb-4 text-sm sm:text-base h-8 sm:h-9 px-2 sm:px-3"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          목록으로
        </Button>

        <Card className="rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-6 md:p-8">
          {/* 헤더 */}
          <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">
                {categoryNames[post.category] || post.category}
              </Badge>
              {post.verified && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  ✓ 인증업체
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium">
                {post.business_name || post.user_name || "익명"}
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
          <div className="mb-4 sm:mb-6 md:mb-8">
            <p className="text-sm sm:text-base text-foreground whitespace-pre-line leading-relaxed break-words">
              {post.content}
            </p>
          </div>

          {/* 이미지 */}
          {post.images && post.images.length > 0 && (
            <div className="mb-4 sm:mb-6 md:mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {post.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`이미지 ${idx + 1}`}
                  className="w-full rounded-lg sm:rounded-xl object-cover"
                />
              ))}
            </div>
          )}

          {/* 댓글 섹션 */}
          <div className="mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-6 md:pt-8 border-t">
            <CommentSection postId={post.id} />
          </div>
        </Card>
      </div>
    </div>
  );
}
