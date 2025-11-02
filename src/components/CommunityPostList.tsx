import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  images: string[];
  created_at: string;
}

interface CommunityPostListProps {
  category: string;
  refresh: number;
}

export default function CommunityPostList({ category, refresh }: CommunityPostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    getCurrentUser();
  }, [category, refresh]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "오류 발생",
        description: "게시글을 불러오는 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "게시글이 삭제되었습니다",
      });

      fetchPosts();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "오류 발생",
        description: "게시글 삭제 중 오류가 발생했습니다",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">로딩 중...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <p className="text-muted-foreground">아직 작성된 게시글이 없습니다</p>
        <p className="text-sm text-muted-foreground mt-2">첫 번째 글을 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{post.title}</CardTitle>
              {currentUserId === post.user_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(post.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale: ko,
              })}
            </p>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-foreground mb-4">{post.content}</p>
            
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {post.images.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`첨부 이미지 ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg border border-border"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
