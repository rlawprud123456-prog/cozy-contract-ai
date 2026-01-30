import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, BookOpen, AlertCircle, FileCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface IdeaItem {
  id: string;
  title: string;
  note: string | null;
  image_url: string;
  is_contract_attached: boolean;
}

export default function SafeIdeaBook() {
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("idea_books")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
        
      setIdeas(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleContract = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("idea_books")
      .update({ is_contract_attached: !currentStatus })
      .eq("id", id);

    if (!error) {
      fetchIdeas();
      if (!currentStatus) {
        toast({ title: "계약서 박제 완료", description: "이 사진이 시공 기준 자료로 설정되었습니다." });
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">로딩 중...</p></div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-6 h-6" />
          <h1 className="text-xl font-bold">안심 아이디어 북</h1>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-4">
          <AlertCircle className="w-5 h-5 mb-2" />
          <p className="text-sm font-medium leading-relaxed">
            원하는 사진을 선택하고 '박제'하세요. 법적 기준이 됩니다.
          </p>
        </div>
      </div>

      {ideas.length === 0 ? (
        <div className="p-4">
          <Card className="p-8 text-center text-muted-foreground">
            <p>저장된 아이디어가 없습니다.</p>
            <p className="text-sm mt-1">DB에 데이터를 추가해주세요.</p>
          </Card>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {ideas.map((item) => (
            <Card
              key={item.id}
              onClick={() => toggleContract(item.id, item.is_contract_attached)}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${
                item.is_contract_attached ? "border-blue-600 ring-4 ring-blue-100" : "border-transparent"
              }`}
            >
              <img src={item.image_url} alt={item.title} className="w-full aspect-video object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                <p className="text-white font-bold text-lg">{item.title}</p>
                <p className="text-white/80 text-sm mt-1">📌 {item.note}</p>
              </div>
              
              {item.is_contract_attached && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-12deg]">
                  <Badge className="bg-red-600/90 text-white text-sm px-4 py-2 rounded-md border-2 border-red-400 shadow-lg">
                    계약 기준 자료 포함됨
                  </Badge>
                </div>
              )}
              
              <div className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                item.is_contract_attached ? 'bg-blue-600' : 'bg-white/50 border-2 border-white'
              }`}>
                <Check className={`w-4 h-4 ${item.is_contract_attached ? 'text-white' : 'text-transparent'}`} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
