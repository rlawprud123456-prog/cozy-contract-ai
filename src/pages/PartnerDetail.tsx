import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppPage } from "@/components/layout/AppPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Star, Building2, CheckCircle2, ArrowRight, Image as ImageIcon } from "lucide-react";

interface Partner {
  id: string;
  business_name: string;
  category: string;
  location: string;
  phone: string;
  description: string;
  portfolio_images: string[] | null;
  status: string;
  verified?: boolean;
}

export default function PartnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPartnerDetail(id);
    }
  }, [id]);

  const fetchPartnerDetail = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("id", partnerId)
        .single();

      if (error) throw error;
      setPartner(data);
    } catch (error) {
      console.error("파트너 정보 로딩 실패:", error);
      toast({
        title: "정보를 불러올 수 없습니다",
        description: "존재하지 않거나 삭제된 파트너입니다.",
        variant: "destructive",
      });
      navigate("/partners");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEstimate = () => {
    navigate("/estimate", { 
      state: { 
        preferredPartner: {
          id: partner?.id,
          name: partner?.business_name
        } 
      } 
    });
  };

  if (loading) {
    return (
      <AppPage title="파트너 정보">
        <div className="space-y-6">
          <Skeleton className="w-full h-64 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </AppPage>
    );
  }

  if (!partner) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* 1. 히어로 섹션 (대표 이미지) */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        {partner.portfolio_images && partner.portfolio_images.length > 0 ? (
          <img 
            src={partner.portfolio_images[0]} 
            alt={partner.business_name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
          <div className="container mx-auto max-w-6xl h-full flex items-end p-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between w-full gap-4">
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                  {partner.category}
                </Badge>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    {partner.business_name}
                  </h1>
                  {partner.status === 'approved' && (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  )}
                </div>
                <p className="text-white/80 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {partner.location}
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={handleRequestEstimate}
                className="bg-primary hover:bg-primary/90"
              >
                견적 요청하기 <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl p-6 grid md:grid-cols-3 gap-6">
        {/* 2. 상세 정보 (좌측) */}
        <div className="md:col-span-2 space-y-6">
          {/* 업체 소개 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-primary" />
                업체 소개
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {partner.description || "등록된 소개글이 없습니다."}
              </p>
            </CardContent>
          </Card>

          {/* 포트폴리오 갤러리 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-primary" />
                시공 포트폴리오
              </h2>
              {partner.portfolio_images && partner.portfolio_images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {partner.portfolio_images.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                      <img 
                        src={img} 
                        alt={`포트폴리오 ${idx + 1}`} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  등록된 포트폴리오 이미지가 없습니다.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 3. 사이드바 정보 (우측) */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="text-center border-b pb-4">
                <p className="text-sm text-muted-foreground">평균 평점</p>
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-500 mt-1">
                  <Star className="w-6 h-6 fill-current" />
                  4.9
                </div>
                <p className="text-xs text-muted-foreground mt-1">최근 12개월 기준</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">연락처</p>
                    <p className="text-sm text-muted-foreground">{partner.phone || "비공개"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">활동 지역</p>
                    <p className="text-sm text-muted-foreground">{partner.location}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button className="w-full" onClick={handleRequestEstimate}>
                  무료 견적 요청하기
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  바로고침 에스크로 안전결제가 적용됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
