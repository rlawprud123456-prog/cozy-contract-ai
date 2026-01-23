import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Check, X, MapPin, Phone, Trash2, Edit2, Star, Image as ImageIcon } from "lucide-react";

export default function Partners() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // 수정 모달 상태
  const [editingPartner, setEditingPartner] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    logo_url: "",
    review_summary: "",
    rating: "5.0",
    portfolio_urls: ""
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error("로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 수정 버튼 클릭 시 폼 채우기
  const openEditDialog = (partner: any) => {
    setEditingPartner(partner);
    setEditForm({
      logo_url: partner.logo_url || "",
      review_summary: partner.review_summary || "",
      rating: partner.rating || "5.0",
      // 배열을 콤마로 구분된 문자열로 변환해서 보여줌
      portfolio_urls: partner.portfolio_images ? partner.portfolio_images.join(", ") : "" 
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingPartner) return;

    try {
      // 콤마로 구분된 이미지 주소를 배열로 변환
      const portfolioArray = editForm.portfolio_urls
        .split(",")
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const { error } = await supabase
        .from("partners")
        .update({
          logo_url: editForm.logo_url,
          review_summary: editForm.review_summary,
          rating: parseFloat(editForm.rating),
          portfolio_images: portfolioArray
        })
        .eq("id", editingPartner.id);

      if (error) throw error;

      toast({ title: "수정 완료", description: "정보가 업데이트되었습니다." });
      setIsDialogOpen(false);
      loadPartners(); // 목록 새로고침
    } catch (e: any) {
      toast({ title: "오류", description: e.message, variant: "destructive" });
    }
  };

  // 삭제 함수
  const deletePartner = async (id: string, name: string) => {
    if (!confirm(`'${name}' 업체를 정말 삭제하시겠습니까?`)) return;
    const { error } = await supabase.from("partners").delete().eq("id", id);
    if (!error) {
      toast({ title: "삭제 완료" });
      loadPartners();
    }
  };

  // 승인/거절 함수
  const updateStatus = async (id: string, status: string) => {
    await supabase.from("partners").update({ status }).eq("id", id);
    toast({ title: status === "approved" ? "승인 완료" : "거절 처리됨" });
    loadPartners();
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">파트너 관리 (CMS)</h1>
          <p className="text-muted-foreground mt-1">로고, 활동 사진, 리뷰를 관리하여 메인 페이지를 꾸며보세요.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {partners.map((partner) => (
          <Card key={partner.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* 로고 미리보기 */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden border bg-muted flex items-center justify-center">
                    {partner.logo_url ? (
                      <img src={partner.logo_url} alt="logo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{partner.business_name}</CardTitle>
                      {partner.status === "approved" && (
                        <Badge className="bg-green-600">승인됨</Badge>
                      )}
                      {partner.status === "pending" && (
                        <Badge variant="outline">대기중</Badge>
                      )}
                      {partner.status === "rejected" && (
                        <Badge variant="destructive">거절됨</Badge>
                      )}
                    </div>
                    <CardDescription>{partner.category}</CardDescription>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {partner.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(partner.id, "approved")} className="bg-green-600 hover:bg-green-700">
                        <Check className="w-4 h-4 mr-1" /> 승인
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(partner.id, "rejected")}>
                        <X className="w-4 h-4 mr-1" /> 거절
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(partner)}>
                    <Edit2 className="w-4 h-4 mr-1" /> 정보 수정
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deletePartner(partner.id, partner.business_name)} className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {partner.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {partner.location}</span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {partner.rating || 5.0}점
                  <span className="ml-2">"{partner.review_summary || "아직 리뷰 없음"}"</span>
                </span>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium mb-2">활동 사진 (URL)</p>
                <div className="flex flex-wrap gap-2">
                  {partner.portfolio_images?.map((img: string, i: number) => (
                    <img key={i} src={img} alt={`portfolio ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border" />
                  ))}
                  {(!partner.portfolio_images || partner.portfolio_images.length === 0) && (
                    <span className="text-xs text-muted-foreground">등록된 사진 없음</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>파트너 정보 상세 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>로고 이미지 URL</Label>
              <Input 
                placeholder="https://example.com/logo.png"
                value={editForm.logo_url}
                onChange={(e) => setEditForm({...editForm, logo_url: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>대표 리뷰 (한줄평)</Label>
              <Input 
                placeholder="친절하고 꼼꼼한 시공!"
                value={editForm.review_summary}
                onChange={(e) => setEditForm({...editForm, review_summary: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>평점 (5.0 만점)</Label>
              <Input 
                type="number" 
                step="0.1" 
                min="0" 
                max="5"
                value={editForm.rating}
                onChange={(e) => setEditForm({...editForm, rating: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>활동 사진 URL (콤마 , 로 구분)</Label>
              <Textarea 
                placeholder="https://img1.jpg, https://img2.jpg"
                value={editForm.portfolio_urls}
                onChange={(e) => setEditForm({...editForm, portfolio_urls: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">여러 장일 경우 콤마(,)로 구분해서 입력해주세요.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
            <Button onClick={handleSave}>저장하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
