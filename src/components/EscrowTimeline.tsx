import { useState } from "react";
import { CheckCircle2, Lock, Camera, ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

// 공정 단계 데이터
const stages = [
  { id: 1, name: "철거", status: "completed", date: "01.10" },
  { id: 2, name: "목공/전기", status: "current", amount: "500만원" },
  { id: 3, name: "타일/욕실", status: "locked", amount: "300만원" },
  { id: 4, name: "도배/마감", status: "locked", amount: "200만원" },
];

export default function EscrowTimeline() {
  const { toast } = useToast();
  const [isPhotoUploaded, setIsPhotoUploaded] = useState(true);

  const handleConfirm = () => {
    toast({
      title: "중도금 지급 승인 완료",
      description: "에스크로 계좌에서 시공사로 500만원이 이체됩니다.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      
      {/* 1. 상단 공정 진행바 */}
      <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-400" />
            <span className="font-bold"> 에스크로 안전 결제 중</span>
          </div>
          <span className="text-sm text-slate-400">진행률 35%</span>
        </div>
        <Progress value={35} className="h-2 mb-4" />
        
        {/* 단계 시각화 */}
        <div className="relative flex justify-between items-center mt-2">
          {/* 배경 선 */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-600 z-0" />
          
          {stages.map((stage) => (
            <div key={stage.id} className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                stage.status === 'completed' ? 'bg-green-500 text-white' :
                stage.status === 'current' ? 'bg-blue-500 text-white ring-4 ring-blue-500/30' :
                'bg-slate-600 text-slate-400'
              }`}>
                {stage.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : stage.id}
              </div>
              <span className={`text-xs mt-1.5 ${stage.status === 'current' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
                {stage.name}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* 2. 현재 단계 승인 카드 */}
      <Card className="p-5 border-0 shadow-lg">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
              현재 단계: 목공/전기
            </span>
            <Camera className="w-4 h-4 text-green-500" />
          </div>
          <p className="font-bold text-lg">시공 인증 사진이 도착했습니다</p>
          <p className="text-sm text-muted-foreground mt-1">
            사진을 확인하고 승인하시면 500만원이 지급됩니다.
          </p>
        </div>

        {/* 업체가 올린 인증 사진 */}
        <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
          <img 
            src="https://images.unsplash.com/photo-1581094794329-cd1096a7a2e8?w=800&q=80" 
            alt="시공 현장" 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            2026.01.30 14:00 촬영
          </div>
        </div>

        {/* 액션 버튼 */}
        <Button className="w-full h-12 text-base font-bold" onClick={handleConfirm}>
          <ArrowRight className="w-5 h-5 mr-2" /> 사진 확인 및 대금 지급하기
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          * 지급 후에는 취소가 불가능합니다. 사진과 현장이 다른 경우 '반려'를 눌러주세요.
        </p>
      </Card>

      {/* 3. 지난 기록 */}
      <Card className="p-5 border-0 shadow-lg">
        <h3 className="font-bold mb-3 text-muted-foreground">지난 기록</h3>
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="w-0.5 h-full bg-slate-200 mt-1" />
          </div>
          <div className="pb-4">
            <div className="flex items-center gap-2">
              <p className="font-semibold">철거 단계 완료</p>
              <span className="text-xs text-muted-foreground">01.10</span>
            </div>
            <p className="text-sm text-muted-foreground">고객님 승인으로 계약금 100만원이 지급되었습니다.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
