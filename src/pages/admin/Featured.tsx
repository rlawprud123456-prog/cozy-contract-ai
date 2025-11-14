import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Star, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Featured() {
  const [partners, setPartners] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const { data } = await supabase
        .from("partners")
        .select("*")
        .eq("status", "approved")
        .order("featured", { ascending: false })
        .order("featured_at", { ascending: false });

      if (data) setPartners(data);
    } catch (error) {
      console.error("Partners loading error:", error);
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const updates: any = {
        featured: !currentFeatured,
        featured_at: !currentFeatured ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from("partners")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      // 히스토리 기록
      if (!currentFeatured) {
        await supabase.from("featured_history").insert({
          partner_id: id,
          featured_at: new Date().toISOString()
        });
      } else {
        const { data: history } = await supabase
          .from("featured_history")
          .select("*")
          .eq("partner_id", id)
          .is("unfeatured_at", null)
          .single();

        if (history) {
          await supabase
            .from("featured_history")
            .update({ unfeatured_at: new Date().toISOString() })
            .eq("id", history.id);
        }
      }

      toast({
        title: currentFeatured ? "이달의 전문가 해제" : "이달의 전문가 선정",
        description: currentFeatured ? "선정이 해제되었습니다." : "이달의 전문가로 선정되었습니다."
      });

      await loadPartners();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">이달의 전문가 관리</h1>
          <p className="text-muted-foreground mt-2">이달의 전문가 선정 및 관리</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/featured-history")}
        >
          <History className="mr-2 h-4 w-4" />
          히스토리
        </Button>
      </div>

      <div className="space-y-4">
        {partners.map((partner) => (
          <Card key={partner.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{partner.business_name}</CardTitle>
                    {partner.featured && (
                      <Badge className="bg-yellow-500">
                        <Star className="mr-1 h-3 w-3" />
                        이달의 전문가
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{partner.category}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">이메일:</span>
                    <span>{partner.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">전화번호:</span>
                    <span>{partner.phone}</span>
                  </div>
                  {partner.featured_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">선정일:</span>
                      <span>{new Date(partner.featured_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => toggleFeatured(partner.id, partner.featured)}
                    variant={partner.featured ? "outline" : "default"}
                    size="sm"
                  >
                    <Star className="mr-2 h-4 w-4" />
                    {partner.featured ? "선정 해제" : "이달의 전문가 선정"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
