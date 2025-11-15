import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  view_count: number;
  like_count: number;
  user_id: string;
  images: string[] | null;
  profiles?: Array<{
    name: string | null;
    email: string;
  }>;
}

const categoryNames: Record<string, string> = {
  diy: "DIY 팁",
  help: "도움 요청",
  jobs: "구인/구직",
  unfair: "부당사례",
  sad: "속상해요",
};

export default function CommunityManagement() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("community_posts")
        .select(`
          *,
          profiles!community_posts_user_id_fkey (
            name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "게시글 조회 실패",
        description: "게시글을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "게시글 삭제 완료",
        description: "게시글이 성공적으로 삭제되었습니다.",
      });

      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "삭제 실패",
        description: "게시글 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">커뮤니티 게시글 관리</h2>
        <p className="text-muted-foreground">
          전체 {posts.length}개의 게시글
        </p>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {categoryNames[post.category] || post.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(post.created_at), "yyyy-MM-dd HH:mm")}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
                
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {post.content}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    작성자: {post.profiles?.[0]?.name || post.profiles?.[0]?.email || "알 수 없음"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.view_count || 0}
                  </span>
                  <span>좋아요 {post.like_count || 0}</span>
                </div>

                {post.images && post.images.length > 0 && (
                  <div className="mt-2">
                    <Badge variant="outline">
                      이미지 {post.images.length}개
                    </Badge>
                  </div>
                )}
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(post.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}

        {posts.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">게시글이 없습니다.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
