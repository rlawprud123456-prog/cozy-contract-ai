import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  images: string[];
  created_at: string;
  user_id: string;
}

interface PostListProps {
  category: string;
}

export default function PostList({ category }: PostListProps) {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      toast({
        title: "로딩 실패",
        description: "게시글을 불러오는 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">로딩 중...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="bg-card rounded-lg p-8 text-center">
        <p className="text-muted-foreground">아직 게시글이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-[var(--shadow-md)] transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>
            {post.images && post.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`post image ${idx + 1}`}
                    className="w-32 h-32 object-cover rounded"
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
