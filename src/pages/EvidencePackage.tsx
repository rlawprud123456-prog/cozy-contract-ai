import { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  FileText,
  Camera,
  CreditCard,
  Download,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppPage } from "@/components/layout/AppPage";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type EvidenceType = "contract" | "photo" | "payment";

interface ProjectInfo {
  name: string;
  contractor: string;
  startDate?: string;
}

interface EvidenceItem {
  id: number;
  type: EvidenceType;
  title: string;
  date: string;
  status: "verified" | "pending";
  file: string;
}

export default function EvidencePackage() {
  const { toast } = useToast();
  const timelineEndRef = useRef<HTMLDivElement>(null);

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: "",
    contractor: "",
    startDate: "",
  });

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([
    {
      id: 1,
      type: "contract",
      title: "표준계약서 (전자서명 완료)",
      date: "2025. 11. 20.",
      status: "verified",
      file: "contract_final_v1.pdf",
    },
    {
      id: 2,
      type: "payment",
      title: "계약금 10% 송금 내역",
      date: "2025. 11. 20.",
      status: "verified",
      file: "bank_receipt_001.jpg",
    },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [evidenceList]);

  const handleGeneratePDF = () => {
    if (!projectInfo.name.trim()) {
      toast({
        title: "프로젝트명 입력 필요",
        description: "증빙 패키지를 생성할 프로젝트 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "증빙 패키지 생성 완료",
        description: `'${projectInfo.name}'의 법적 효력이 있는 PDF 리포트가 생성되었습니다.`,
      });
    }, 2000);
  };

  const handleFileUpload = (type: EvidenceType) => {
    const typeName =
      type === "photo"
        ? "현장 시공 사진"
        : type === "payment"
        ? "결제 영수증"
        : "계약서/변경합의서";

    const date = new Date();
    const formattedDate = `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;

    const newItem: EvidenceItem = {
      id: Date.now(),
      type,
      title: `${typeName} 업로드`,
      date: formattedDate,
      status: "pending",
      file: `upload_${date.getTime()}.jpg`,
    };

    setEvidenceList((prev) => [...prev, newItem]);

    setTimeout(() => {
      setEvidenceList((prev) =>
        prev.map((item) =>
          item.id === newItem.id ? { ...item, status: "verified" as const } : item
        )
      );
      toast({
        title: "타임스탬프 인증 완료",
        description: "블록체인 네트워크에 해시값이 기록되었습니다.",
      });
    }, 1500);
  };

  const getTypeBadgeVariant = (type: EvidenceType) => {
    switch (type) {
      case "contract":
        return "default";
      case "payment":
        return "secondary";
      default:
        return "outline";
    }
  };

  const renderTypeIcon = (type: EvidenceType) => {
    switch (type) {
      case "contract":
        return <FileText className="w-4 h-4" />;
      case "payment":
        return <CreditCard className="w-4 h-4" />;
      default:
        return <Camera className="w-4 h-4" />;
    }
  };

  return (
    <AppPage
      title="소비자 자동 증빙 패키지"
      description="계약·시공·결제 데이터 자동 아카이빙 시스템"
      icon={<ShieldCheck className="w-6 h-6 text-accent" />}
      maxWidth="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 입력 컨트롤 패널 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 프로젝트 정보 카드 */}
          <SectionCard title="프로젝트 정보">
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name" className="text-xs">
                  프로젝트 명
                </Label>
                <Input
                  id="project-name"
                  type="text"
                  placeholder="예: 전주 효자동 리모델링"
                  value={projectInfo.name}
                  onChange={(e) =>
                    setProjectInfo((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="contractor" className="text-xs">
                  시공 업체
                </Label>
                <Input
                  id="contractor"
                  type="text"
                  placeholder="업체명 입력"
                  value={projectInfo.contractor}
                  onChange={(e) =>
                    setProjectInfo((prev) => ({ ...prev, contractor: e.target.value }))
                  }
                  className="mt-1.5"
                />
              </div>
            </div>
          </SectionCard>

          {/* 업로드 액션 버튼들 */}
          <SectionCard title="증빙 자료 추가">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleFileUpload("contract")}
                className="h-24 flex flex-col items-center justify-center gap-2 border-dashed hover:bg-accent"
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">계약서</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleFileUpload("photo")}
                className="h-24 flex flex-col items-center justify-center gap-2 border-dashed hover:bg-accent"
              >
                <Camera className="w-5 h-5" />
                <span className="text-xs">현장 사진</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleFileUpload("payment")}
                className="col-span-2 h-16 flex items-center justify-center gap-2 border-dashed hover:bg-accent"
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">결제 영수증 / 송금 내역 추가</span>
              </Button>
            </div>
          </SectionCard>
        </div>

        {/* 우측: 타임라인 디스플레이 */}
        <div className="lg:col-span-2">
          <SectionCard
            title="실시간 증빙 타임라인"
            headerRight={
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  Total: {evidenceList.length}건
                </Badge>
                <Badge variant="default" className="text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 보안 연결됨
                </Badge>
              </div>
            }
            className="h-[600px] flex flex-col"
          >
            {/* 타임라인 본문 (스크롤 영역) */}
            <div className="flex-1 overflow-y-auto -mx-6 px-6 -mb-6 pb-6">
              <div className="relative border-l-2 border-border ml-3 space-y-6 pb-2">
                {evidenceList.map((item) => (
                  <div
                    key={item.id}
                    className="relative pl-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    {/* 타임라인 점 */}
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-card bg-primary shadow-sm" />

                    {/* 카드 내용 */}
                    <div className="bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {renderTypeIcon(item.type)}
                          <span className="font-bold text-sm">{item.title}</span>
                        </div>
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.date}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <code className="text-xs text-muted-foreground truncate max-w-[150px] bg-muted px-2 py-0.5 rounded">
                          {item.file}
                        </code>
                        {item.status === "verified" ? (
                          <Badge
                            variant={getTypeBadgeVariant(item.type)}
                            className="text-[11px] flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> 타임스탬프 인증
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[11px] flex items-center gap-1 animate-pulse"
                          >
                            <Clock className="w-3 h-3" /> 블록체인 기록 중...
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={timelineEndRef} />
              </div>
            </div>

            {/* 하단 액션 버튼 */}
            <div className="mt-6 pt-6 border-t -mx-6 px-6 -mb-6 pb-6">
              <Button
                type="button"
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="w-full h-14 text-lg font-bold shadow-lg"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    패키징 중...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    증빙 패키지(PDF) 원클릭 생성
                  </>
                )}
              </Button>
              <p className="text-center text-[10px] text-muted-foreground mt-3">
                * 생성된 문서는{" "}
                <span className="font-bold">전자문서 및 전자거래 기본법</span>에 의거하여
                법적 효력을 가집니다.
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </AppPage>
  );
}
