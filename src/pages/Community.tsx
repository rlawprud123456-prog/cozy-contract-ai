import { Link } from "react-router-dom";
import { 
  Frown, AlertTriangle, Lightbulb, Briefcase, HelpCircle, 
  ChevronRight, MessageSquare, ThumbsUp, Eye
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const COMMUNITY_CATEGORIES = [
  { 
    id: "sad", 
    icon: Frown, 
    label: "속상해요", 
    desc: "시공 스트레스 털어놓기",
    path: "/community/sad",
    color: "bg-blue-100 text-blue-600"
  },
  { 
    id: "unfair", 
    icon: AlertTriangle, 
    label: "억울해요", 
    desc: "부당한 경험 공유",
    path: "/community/unfair",
    color: "bg-red-100 text-red-600"
  },
  { 
    id: "diy-tips", 
    icon: Lightbulb, 
    label: "셀프 인테리어", 
    desc: "DIY 팁과 노하우",
    path: "/community/diy-tips",
    color: "bg-yellow-100 text-yellow-600"
  },
  { 
    id: "jobs", 
    icon: Briefcase, 
    label: "구인구직", 
    desc: "인테리어 일자리 정보",
    path: "/community/jobs",
    color: "bg-green-100 text-green-600"
  },
  { 
    id: "help", 
    icon: HelpCircle, 
    label: "질문있어요", 
    desc: "궁금한 것 물어보기",
    path: "/community/help",
    color: "bg-purple-100 text-purple-600"
  },
];

export default function Community() {
  const { data: popularPosts = [] } = useQuery({
    queryKey: ['community-popular-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select('id, title, category, like_count, view_count, images')
        .order('like_count', { ascending: false, nullsFirst: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="pb-24 min-h-screen bg-background">
      {/* 헤더 */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground">커뮤니티</h1>
        <p className="text-sm text-muted-foreground mt-1">
          인테리어 이야기를 나눠보세요
        </p>
      </div>

      {/* 카테고리 목록 */}
      <div className="px-4 space-y-3">
        {COMMUNITY_CATEGORIES.map((cat) => (
          <Link key={cat.id} to={cat.path}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground">{cat.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 인기글 */}
      <div className="mt-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg text-foreground">🔥 인기글</h2>
        </div>

        {popularPosts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            아직 게시글이 없습니다
          </div>
        ) : (
          <div className="space-y-3">
            {popularPosts.map((post: any) => (
              <Link key={post.id} to={`/community/post/${post.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-foreground line-clamp-1">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {post.like_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.view_count || 0}
                          </span>
                        </div>
                      </div>
                      {post.images?.[0] && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                          <img 
                            src={post.images[0]} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
