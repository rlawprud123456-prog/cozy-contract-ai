import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Award, MapPin, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PartnerProfile() {
  const [loading, setLoading] = useState(true);
  const [partnerInfo, setPartnerInfo] = useState({
    name: "로딩 중...",
    completedInGangwon: 0,
    grade: "normal"
  });

  useEffect(() => {
    fetchPartnerInfo();
  }, []);

  const fetchPartnerInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("partners")
        .select("id, business_name, grade")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        const { count } = await supabase
          .from("contracts")
          .select("*", { count: 'exact', head: true })
          .eq("partner_id", data.id)
          .eq("status", "completed");

        setPartnerInfo({
          name: data.business_name || "업체명 없음",
          completedInGangwon: count || 0,
          grade: (data as any).grade || "normal"
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">로딩 중...</p></div>;

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{partnerInfo.name}</h1>
                {partnerInfo.grade === 'prime' && <Badge className="bg-amber-500 text-white border-0">PRIME</Badge>}
              </div>
              <p className="text-slate-400 text-sm">종합 인테리어 전문 • 강원특별자치도</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-blue-300">실내건축공사업 면허 보유</p>
                <p className="text-xs text-slate-400 mt-0.5">정식 등록된 안전한 시공업체입니다.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-amber-300">
                  강원도 내 시공 {partnerInfo.completedInGangwon}건 완료
                </p>
                <p className="text-xs text-slate-400 mt-0.5">지역 특성을 잘 아는 검증된 파트너입니다.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-green-300">하자 이행 보증보험 가입</p>
                <p className="text-xs text-slate-400 mt-0.5">공사 후에도 100% 안전하게 보호받습니다.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
