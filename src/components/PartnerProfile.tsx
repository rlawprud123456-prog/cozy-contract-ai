import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Camera, CheckCircle2 } from "lucide-react";

interface Partner {
  id: string;
  business_name: string;
  location: string | null;
  category: string;
  completed_count?: number;
  dispute_count?: number;
}

interface PortfolioItem {
  id: string;
  project_name: string;
  created_at: string;
}

export default function PartnerProfile() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    try {
      const { data: partnerData } = await supabase
        .from("partners")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (partnerData) {
        setPartner(partnerData);

        const { data: photos } = await supabase
          .from("evidence_packages")
          .select("*")
          .eq("status", "approved")
          .limit(6);
        
        setPortfolio(photos || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">데이터 로딩 중...</p></div>;
  if (!partner) return <div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">등록된 파트너가 없습니다.</p></div>;

  const isSafeMaster = (partner.completed_count || 0) >= 10 && (partner.dispute_count || 0) === 0;

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{partner.business_name}</h1>
            <p className="text-slate-400 text-sm">{partner.location || "지역 정보 없음"} • {partner.category || "인테리어"}</p>
          </div>
          {isSafeMaster && (
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <ShieldCheck className="w-8 h-8 text-white" />
                <span className="absolute -bottom-1 bg-white text-amber-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">MASTER</span>
              </div>
              <span className="text-xs text-amber-400 mt-2 font-semibold">안심 마스터</span>
            </div>
          )}
        </div>
        
        {isSafeMaster ? (
          <div className="mt-4 p-3 bg-white/10 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">검증된 데이터가 증명합니다</p>
              <p className="text-xs text-slate-300 mt-1">
                이 파트너는 에스크로 정상 완공 {partner.completed_count || 0}건을 달성했으며,
                <span className="text-green-400 font-bold"> 환불/분쟁률 0%</span>를 기록 중입니다.
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">아직 안심 마스터 등급 달성 전입니다. (완공 {partner.completed_count || 0}건)</p>
        )}
      </Card>

      <Card className="p-5 border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <Camera className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-lg">가공 없는 리얼 포트폴리오</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">업체가 대금 지급을 위해 올린 100% 실제 현장 증빙 사진입니다.</p>
        
        {portfolio.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            등록된 현장 인증 사진이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {portfolio.map((item) => (
              <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                  <Camera className="w-8 h-8 text-slate-400" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-2">
                  <Badge variant="secondary" className="w-fit text-[10px] bg-white/20 text-white border-0 mb-1">Raw Data</Badge>
                  <p className="text-white text-xs font-medium">{item.project_name || "시공 현장"}</p>
                  <p className="text-white/70 text-[10px]">{new Date(item.created_at).toLocaleDateString()} 인증됨</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
