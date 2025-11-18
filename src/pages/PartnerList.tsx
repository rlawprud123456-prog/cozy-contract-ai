import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PartnerList() {
  const { category } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadPartners = async () => {
      if (!category) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("partner_profiles")
          .select("*")
          .eq("category", category);

        if (error) throw error;
        setItems(data || []);
      } catch (error: any) {
        console.error("파트너 로딩 오류:", error);
        toast({
          title: "로딩 실패",
          description: "파트너 정보를 불러올 수 없습니다.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadPartners();
  }, [category, toast]);

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-3 sm:p-4">
      <div className="container mx-auto max-w-4xl py-4 sm:py-6 md:py-8">
        <Link to="/partners" className="inline-flex items-center gap-2 text-accent mb-3 sm:mb-4 hover:underline text-sm sm:text-base">
          <ArrowLeft className="h-4 w-4" />
          카테고리 목록으로
        </Link>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">{category}</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 md:mb-8">
          {loading ? "로딩 중..." : `전문가 ${items.length}명`}
        </p>

        {loading ? (
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="py-12 text-center text-muted-foreground">
              로딩 중...
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="py-12 text-center text-muted-foreground">
              해당 카테고리에 등록된 전문가가 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((partner) => (
              <Card key={partner.id} className="shadow-[var(--shadow-card)]">
                <CardHeader>
                  <CardTitle>{partner.business_name}</CardTitle>
                  <CardDescription>{partner.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  {partner.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {partner.description}
                    </p>
                  )}
                  <Button className="bg-primary hover:bg-primary/90">상담 신청</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
