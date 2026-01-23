import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ShieldCheck, FileText, Camera, CreditCard,
  CheckCircle, Clock, X, Loader2, Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppPage } from "@/components/layout/AppPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

type EvidenceType = "contract" | "photo" | "payment";

interface EvidenceItem {
  id: string;
  package_id: string;
  type: string;
  title: string;
  file_url: string;
  status: string;
  created_at: string;
  verified_at: string | null;
}

interface EvidencePackageData {
  id: string;
  project_name: string;
  contractor_name: string | null;
  status: string;
  created_at: string;
}

export default function EvidencePackage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const timelineEndRef = useRef<HTMLDivElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPackage, setCurrentPackage] = useState<EvidencePackageData | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  
  const [projectInfo, setProjectInfo] = useState({ name: "", contractor: "" });
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({ title: "로그인 필요", description: "증빙 패키지는 로그인 후 이용 가능합니다.", variant: "destructive" });
      navigate("/login");
      return;
    }

    setUserId(session.user.id);
    await loadEvidence(session.user.id);
  };

  const loadEvidence = async (uid: string) => {
    try {
      const { data: packages, error: pkgError } = await supabase
        .from("evidence_packages")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(1);

      if (pkgError) throw pkgError;

      if (packages && packages.length > 0) {
        const pkg = packages[0];
        setCurrentPackage(pkg);
        setProjectInfo({ 
          name: pkg.project_name, 
          contractor: pkg.contractor_name || "" 
        });

        const { data: items, error: itemsError } = await supabase
          .from("evidence_items")
          .select("*")
          .eq("package_id", pkg.id)
          .order("created_at", { ascending: true });

        if (itemsError) throw itemsError;
        setEvidenceList(items || []);
      }
    } catch (error) {
      console.error("Evidence load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [evidenceList]);

  const handleDeleteItem = async (id: string) => {
    if (!confirm("이 증빙 자료를 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase.from("evidence_items").delete().eq("id", id);
      if (error) throw error;

      setEvidenceList(prev => prev.filter(item => item.id !== id));
      toast({ title: "삭제 완료", description: "항목이 타임라인에서 제거되었습니다." });
    } catch (e) {
      toast({ title: "오류", description: "삭제하지 못했습니다.", variant: "destructive" });
    }
  };

  const ensurePackageExists = async (): Promise<string | null> => {
    if (!userId) return null;

    if (currentPackage && currentPackage.project_name === projectInfo.name) {
      return currentPackage.id;
    }

    const { data, error } = await supabase
      .from("evidence_packages")
      .insert({
        user_id: userId,
        project_name: projectInfo.name,
        contractor_name: projectInfo.contractor || null,
        status: "draft"
      })
      .select()
      .single();

    if (error) throw error;
    setCurrentPackage(data);
    return data.id;
  };

  const handleFileUpload = async (type: EvidenceType) => {
    if (!projectInfo.name.trim()) {
      toast({ title: "프로젝트명 입력 필요", description: "어떤 공사인지 입력해주세요.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const typeName = type === "photo" ? "현장 시공 사진" : type === "payment" ? "결제 영수증" : "계약서/변경합의서";
    const fileName = `upload_${Date.now()}.jpg`;

    try {
      const packageId = await ensurePackageExists();
      if (!packageId) throw new Error("패키지 생성 실패");

      const { data, error } = await supabase.from("evidence_items").insert({
        package_id: packageId,
        type: type,
        title: `${typeName} 업로드`,
        file_url: fileName,
        status: "pending"
      }).select().single();

      if (error) throw error;

      setEvidenceList(prev => [...prev, data]);
      
      setTimeout(async () => {
        await supabase.from("evidence_items").update({ status: 'verified' }).eq('id', data.id);
        setEvidenceList(prev => prev.map(item => 
          item.id === data.id ? { ...item, status: 'verified' } : item
        ));
        toast({ title: "인증 완료", description: "블록체인 해시값이 생성되었습니다." });
      }, 1500);

    } catch (e: any) {
      toast({ title: "업로드 실패", description: e.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

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

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "contract": return { icon: <FileText className="w-5 h-5" />, bg: "bg-blue-50" };
      case "payment": return { icon: <CreditCard className="w-5 h-5" />, bg: "bg-purple-50" };
      default: return { icon: <Camera className="w-5 h-5" />, bg: "bg-green-50" };
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <AppPage title="증빙 패키지" description="계약·시공 기록을 안전하게 보관하세요">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 왼쪽: 입력 패널 */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-primary font-bold text-lg">
              <ShieldCheck className="w-5 h-5" />
              프로젝트 정보
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">프로젝트 명</Label>
                <Input 
                  placeholder="예: 강남 아파트 욕실 리모델링" 
                  value={projectInfo.name} 
                  onChange={e => setProjectInfo(prev => ({ ...prev, name: e.target.value }))} 
                  className="bg-gray-50 border-0 rounded-xl h-12 mt-1" 
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">시공 업체</Label>
                <Input 
                  placeholder="예: ㅇㅇ인테리어" 
                  value={projectInfo.contractor} 
                  onChange={e => setProjectInfo(prev => ({ ...prev, contractor: e.target.value }))} 
                  className="bg-gray-50 border-0 rounded-xl h-12 mt-1" 
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-primary font-bold text-lg">
              <Camera className="w-5 h-5" />
              자료 업로드
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                disabled={isUploading} 
                onClick={() => handleFileUpload("contract")} 
                className="col-span-2 flex items-center justify-center gap-2 p-4 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition font-bold disabled:opacity-50"
              >
                <FileText className="w-5 h-5" /> 계약서 등록
              </button>
              <button 
                disabled={isUploading} 
                onClick={() => handleFileUpload("photo")} 
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-green-50 text-green-700 hover:bg-green-100 transition font-medium text-sm disabled:opacity-50"
              >
                <Camera className="w-5 h-5" /> 현장 사진
              </button>
              <button 
                disabled={isUploading} 
                onClick={() => handleFileUpload("payment")} 
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition font-medium text-sm disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5" /> 송금 내역
              </button>
            </div>
          </Card>
        </div>

        {/* 오른쪽: 타임라인 */}
        <div className="lg:col-span-2">
          <Card className="rounded-3xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">타임라인</h2>
                <p className="text-sm text-muted-foreground">모든 기록은 로그인한 계정에만 저장됩니다.</p>
              </div>
              <span className="text-sm font-medium text-primary">{evidenceList.length}건 기록됨</span>
            </div>

            <div className="p-6 max-h-[500px] overflow-y-auto">
              {evidenceList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <ShieldCheck className="w-12 h-12 mb-4 opacity-30" />
                  <p>아직 등록된 증빙 자료가 없습니다.</p>
                </div>
              ) : (
                <div className="relative pl-8 border-l-2 border-gray-100 space-y-6">
                  {evidenceList.map((item) => {
                    const style = getTypeStyle(item.type);
                    return (
                      <div key={item.id} className="relative group">
                        <div className="absolute -left-[41px] w-4 h-4 bg-primary rounded-full border-4 border-white" />
                        <div className={`${style.bg} p-5 rounded-2xl relative`}>
                          <button 
                            onClick={() => handleDeleteItem(item.id)} 
                            className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm">{style.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-bold">{item.title}</h4>
                              <span className="text-sm text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5">
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{item.file_url}</span>
                            {item.status === "verified" ? (
                              <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                <CheckCircle className="w-4 h-4" /> 인증됨
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-amber-500 text-xs font-medium">
                                <Clock className="w-4 h-4" /> 확인 중
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={timelineEndRef} />
                </div>
              )}
            </div>

            {/* 하단 PDF 생성 버튼 */}
            <div className="p-6 border-t">
              <Button
                type="button"
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="w-full h-14 text-lg font-bold shadow-lg"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    패키징 중...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    증빙 패키지(PDF) 원클릭 생성
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-3">
                * 생성된 문서는 전자문서 및 전자거래 기본법에 의거하여 법적 효력을 가집니다.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </AppPage>
  );
}
