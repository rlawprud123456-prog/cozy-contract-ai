import { useEffect, useState } from "react";
import { supabase, type Comment } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Trash2 } from "lucide-react";

export default function CommentSection({ postId }: { postId: string }) {
  const { toast } = useToast();
  const [list, setList] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles:user_id(name, avatar_url)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      const comments = (data || []).map((item: any) => ({
        ...item,
        profiles: item.profiles
      }));
      
      setList(comments);
    } catch (error) {
      console.error("댓글 로드 실패:", error);
    }
  };

  useEffect(() => {
    load();

    // 실시간 댓글 구독
    const channel = supabase
      .channel("comments_" + postId)
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "comments", 
          filter: `post_id=eq.${postId}`
        },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const add = async () => {
    if (!currentUser) {
      toast({
        title: "로그인 필요",
        description: "댓글을 작성하려면 로그인해주세요",
        variant: "destructive",
      });
      return;
    }

    if (!text.trim()) {
      toast({
        title: "내용 입력",
        description: "댓글 내용을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: currentUser.id,
        content: text.trim()
      });

      if (error) throw error;

      setText("");
      toast({
        title: "댓글 등록",
        description: "댓글이 등록되었습니다",
      });
      
      await load();
    } catch (error) {
      console.error(error);
      toast({
        title: "오류 발생",
        description: "댓글 등록에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "댓글이 삭제되었습니다",
      });

      await load();
    } catch (error) {
      console.error(error);
      toast({
        title: "오류 발생",
        description: "댓글 삭제에 실패했습니다",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-8 pt-8 border-t">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        댓글 <span className="text-accent">{list.length}</span>
      </h3>

      {/* 댓글 작성 폼 */}
      <div className="mb-6 space-y-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={currentUser ? "댓글을 입력하세요" : "로그인 후 댓글을 작성할 수 있습니다"}
          disabled={!currentUser}
          className="min-h-[100px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              add();
            }
          }}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Ctrl + Enter로 등록
          </span>
          <Button 
            onClick={add} 
            disabled={loading || !currentUser || !text.trim()}
            className="bg-accent hover:bg-accent/90"
          >
            {loading ? "등록 중..." : "댓글 등록"}
          </Button>
        </div>
      </div>

      {/* 댓글 목록 */}
      {list.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>첫 댓글을 남겨보세요!</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((c) => (
            <li 
              key={c.id} 
              className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {c.profiles?.name || "익명"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {/* 삭제 버튼 (본인 댓글만) */}
                {currentUser?.id === c.user_id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(c.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {c.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
