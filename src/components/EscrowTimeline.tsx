import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Camera, Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface Stage {
  id: string;
  stage_name: string;
  status: string;
  amount: number | null;
  evidence_photo_url: string | null;
}

export default function EscrowTimeline() {
  const { toast } = useToast();
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: contract } = await supabase
        .from("contracts")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "in_progress")
        .limit(1)
        .maybeSingle();

      if (contract) {
        const { data: stageData } = await supabase
          .from("contract_stages")
          .select("*")
          .eq("contract_id", contract.id)
          .order("created_at", { ascending: true });
        
        setStages(stageData || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (stageId: string) => {
    const { error } = await supabase
      .from("contract_stages")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", stageId);

    if (!error) {
      toast({ title: "지급 승인 완료", description: "에스크로 계좌에서 시공사로 이체됩니다." });
      fetchStages();
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">로딩 중...</p></div>;

  const completedCount = stages.filter(s => s.status === 'completed').length;
  const progressPercent = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0;
  const currentStage = stages.find(s => s.status === 'current') || stages.find(s => s.status === 'locked');

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-400" />
            <span className="font-bold">에스크로 안전 결제</span>
          </div>
          <span className="text-sm text-slate-400">진행률 {progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2 mb-4" />
        
        {stages.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">등록된 공정 단계가 없습니다.</p>
        ) : (
          <div className="relative flex justify-between items-center mt-2">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-600 z-0" />
            {stages.map((stage, idx) => (
              <div key={stage.id} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  stage.status === 'completed' ? 'bg-green-500 text-white' :
                  stage.status === 'current' ? 'bg-blue-500 text-white ring-4 ring-blue-500/30' :
                  'bg-slate-600 text-slate-400'
                }`}>
                  {stage.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <span className={`text-xs mt-1.5 ${stage.status === 'current' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
                  {stage.stage_name}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {currentStage && (
        <Card className="p-5 border-0 shadow-lg">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                현재 단계: {currentStage.stage_name}
              </span>
              <Camera className="w-4 h-4 text-green-500" />
            </div>
            <p className="font-bold text-lg">시공 인증 사진 확인</p>
            <p className="text-sm text-muted-foreground mt-1">
              사진을 승인하면 {currentStage.amount?.toLocaleString() || 0}원이 지급됩니다.
            </p>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-slate-100">
            {currentStage.evidence_photo_url ? (
              <img 
                src={currentStage.evidence_photo_url} 
                alt="시공 현장" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <p>업체가 아직 사진을 등록하지 않았습니다.</p>
              </div>
            )}
          </div>

          <Button 
            className="w-full h-12 text-base font-bold" 
            onClick={() => handleConfirm(currentStage.id)}
            disabled={!currentStage.evidence_photo_url || currentStage.status === 'completed'}
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            {currentStage.status === 'completed' ? "이미 지급됨" : "사진 확인 및 대금 지급하기"}
          </Button>
        </Card>
      )}
    </div>
  );
}
