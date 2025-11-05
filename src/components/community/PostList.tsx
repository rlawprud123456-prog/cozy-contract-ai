import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, MessageCircle } from "lucide-react";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  images: string[];
  created_at: string;
  view_count: number;
  user_name?: string;
  business_name?: string;
  verified?: boolean;
  comment_count?: number;
}

interface PostListProps {
  category: string;
  refresh: number;
}

export default function PostList({ category, refresh }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    fetchCurrentUser();
  }, [category, refresh]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch additional data for each post
      const postsWithDetails = await Promise.all(
        (data || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', post.user_id)
            .single();

          const { data: partner } = await supabase
            .from('partners')
            .select('business_name, verified')
            .eq('user_id', post.user_id)
            .single();

          const { count: commentCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);
          
          return {
            ...post,
            user_name: profile?.name,
            business_name: partner?.business_name,
            verified: partner?.verified,
            comment_count: commentCount || 0,
          };
        })
      );
      
      setPosts(postsWithDetails);
    } catch (error: any) {
      toast({
        title: "게시글 불러오기 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "게시글이 삭제되었습니다",
      });
      fetchPosts();
    } catch (error: any) {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">로딩 중...</div>;
  }

  if (posts.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">첫 게시글을 작성해보세요</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card
          key={post.id}
          className="cursor-pointer hover:shadow-md transition"
          onClick={() => navigate(`/community/post/${post.id}`)}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {post.verified && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      ✓ 인증업체
                    </Badge>
                  )}
                </div>
                <CardTitle className="hover:text-primary transition">
                  {post.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span>{post.business_name || post.user_name || "익명"}</span>
                  <span>·</span>
                  <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.view_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {post.comment_count}
                  </span>
                </CardDescription>
              </div>
              {currentUserId === post.user_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(post.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {post.images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`게시글 이미지 ${index + 1}`}
                    className="w-full h-40 object-cover rounded"
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
