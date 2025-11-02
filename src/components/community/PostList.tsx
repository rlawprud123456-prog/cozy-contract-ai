import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  images: string[];
  created_at: string;
  profiles?: {
    name: string;
  };
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
      
      // Fetch user names separately
      const postsWithProfiles = await Promise.all(
        (data || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', post.user_id)
            .single();
          
          return { ...post, profiles: profile };
        })
      );
      
      setPosts(postsWithProfiles);
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
        <Card key={post.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  {post.profiles?.name || "익명"} · {new Date(post.created_at).toLocaleDateString('ko-KR')}
                </CardDescription>
              </div>
              {currentUserId === post.user_id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>게시글을 삭제하시겠습니까?</AlertDialogTitle>
                      <AlertDialogDescription>
                        이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(post.id)}>
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
