import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Download, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast({
        title: "설치 안내",
        description: "브라우저 메뉴에서 '홈 화면에 추가'를 선택하여 앱을 설치할 수 있습니다.",
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
      toast({
        title: "설치 완료",
        description: "새로고침 앱이 설치되었습니다!",
      });
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Smartphone className="w-16 h-16 text-primary" />
            </div>
            <CardTitle className="text-3xl">새로고침 앱 설치</CardTitle>
            <CardDescription className="text-lg">
              홈 화면에서 바로 접속하고 오프라인에서도 사용하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isInstalled ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">이미 설치되어 있습니다!</h3>
                <p className="text-muted-foreground">
                  새로고침 앱을 홈 화면에서 찾아보세요.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">빠른 접속</h4>
                      <p className="text-sm text-muted-foreground">
                        홈 화면 아이콘을 탭하면 바로 실행됩니다
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">오프라인 지원</h4>
                      <p className="text-sm text-muted-foreground">
                        인터넷이 없어도 기본 기능을 사용할 수 있습니다
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">앱처럼 사용</h4>
                      <p className="text-sm text-muted-foreground">
                        전체 화면으로 더 편안한 경험을 제공합니다
                      </p>
                    </div>
                  </div>
                </div>

                {isInstallable ? (
                  <Button 
                    onClick={handleInstallClick} 
                    className="w-full" 
                    size="lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    지금 설치하기
                  </Button>
                ) : (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">수동 설치 방법</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><strong>iPhone/iPad:</strong> Safari에서 공유 버튼 → "홈 화면에 추가"</p>
                      <p><strong>Android:</strong> Chrome 메뉴 → "홈 화면에 추가" 또는 "앱 설치"</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Install;
