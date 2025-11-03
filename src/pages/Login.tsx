import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const KakaoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#FEE500" />
    <path
      d="M12 7c-3.313 0-6 2.134-6 4.767 0 1.7 1.126 3.185 2.835 3.997-.098.375-.355 1.355-.406 1.562-.064.258.095.255.2.186.083-.054 1.33-.905 1.872-1.27.478.07.972.108 1.498.108 3.313 0 6-2.134 6-4.767S15.313 7 12 7z"
      fill="#381E1F"
    />
  </svg>
);

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/";

  const signInWithKakao = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (e: any) {
      console.error("카카오 로그인 오류:", e);
      toast({
        title: "카카오 로그인 실패",
        description: e?.message || "로그인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">로그인</h1>
          <p className="text-sm text-muted-foreground">
            새로고침 서비스를 이용하려면 로그인이 필요합니다
          </p>
        </div>

        {/* 이메일/비밀번호 폼은 여기에 추가 가능 */}

        <div className="space-y-3">
          <Button
            onClick={signInWithKakao}
            disabled={loading}
            className="w-full h-12 text-base font-medium hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: "#FEE500", color: "#111" }}
          >
            <KakaoIcon />
            <span className="ml-2">
              {loading ? "로그인 중..." : "카카오로 시작하기"}
            </span>
          </Button>

          <Button
            variant="outline"
            className="w-full h-12"
            onClick={() => navigate("/")}
            disabled={loading}
          >
            취소
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          로그인하시면{" "}
          <a href="/terms" className="underline hover:text-foreground">
            이용약관
          </a>{" "}
          및{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            개인정보처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
