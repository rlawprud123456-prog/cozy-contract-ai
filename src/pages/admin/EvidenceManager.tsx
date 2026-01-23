import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, CheckCircle2, User, FileText, Calendar, Camera, CreditCard } from "lucide-react";

interface EvidenceItemWithPackage {
  id: string;
  package_id: string;
  type: string;
  title: string;
  file_url: string;
  status: string;
  created_at: string;
  evidence_packages: {
    id: string;
    user_id: string;
    project_name: string;
    contractor_name: string | null;
  } | null;
}

export default function EvidenceManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<EvidenceItemWithPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllEvidence();
  }, []);

  const loadAllEvidence = async () => {
    try {
      const { data, error } = await supabase
        .from("evidence_items")
        .select(`
          *,
          evidence_packages (
            id,
            user_id,
            project_name,
            contractor_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("관리자 권한으로 이 자료를 영구 삭제하시겠습니까?")) return;

    const { error } = await supabase.from("evidence_items").delete().eq("id", id);
    if (!error) {
      setItems(prev => prev.filter(i => i.id !== id));
      toast({ title: "삭제 완료", description: "항목이 삭제되었습니다." });
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'verified' ? 'pending' : 'verified';
    const { error } = await supabase.from("evidence_items").update({ status: newStatus }).eq('id', id);
    
    if (!error) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
      toast({ title: "상태 변경", description: `상태가 ${newStatus === 'verified' ? '인증됨' : '대기중'}으로 변경되었습니다.` });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "contract": return <FileText className="w-4 h-4" />;
      case "payment": return <CreditCard className="w-4 h-4" />;
      default: return <Camera className="w-4 h-4" />;
    }
  };

  if (loading) return <div className="p-8 text-center">데이터 로딩 중...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">증빙 패키지 통합 관리</h1>
        <p className="text-muted-foreground">전체 회원의 증빙 자료 업로드 현황입니다. (총 {items.length}건)</p>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">데이터가 없습니다.</p>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <span className="font-semibold">{item.title}</span>
                      {item.status === 'verified' ? (
                        <Badge variant="default" className="bg-green-500">인증됨</Badge>
                      ) : (
                        <Badge variant="secondary">대기중</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="w-3 h-3" /> 
                      User ID: {item.evidence_packages?.user_id?.slice(0, 8)}...
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => toggleStatus(item.id, item.status)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      {item.status === 'verified' ? "인증 취소" : "인증 승인"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">프로젝트</span>
                  <p className="font-medium">{item.evidence_packages?.project_name || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">시공사</span>
                  <p className="font-medium">{item.evidence_packages?.contractor_name || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 업로드 일시
                  </span>
                  <p className="font-medium">{new Date(item.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">파일</span>
                  <p className="font-medium truncate">{item.file_url}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
