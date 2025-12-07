import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Briefcase } from "lucide-react";

const KakaoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#FEE500" />
    <path
      d="M12 7c-3.313 0-6 2.134-6 4.767 0 1.7 1.126 3.185 2.835 3.997-.098.375-.355 1.355-.406 1.562-.064.258.095.255.2.186.083-.054 1.33-.905 1.872-1.27.478.07.972.108 1.498.108 3.313 0 6-2.134 6-4.767S15.313 7 12 7z"
      fill="#381E1F"
    />
  </svg>
);

const emailSchema = z.string().email("올바른 이메일을 입력해주세요");
const passwordSchema = z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다");

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const from = (location.state as any)?.from?.pathname || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    // 유효성 검사
    const emailValidation = emailSchema.safeParse(email);
    const passwordValidation = passwordSchema.safeParse(password);

    if (!emailValidation.success) {
      setEmailError(emailValidation.error.errors[0].message);
      return;
    }

    if (!passwordValidation.success) {
      setPasswordError(passwordValidation.error.errors[0].message);
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      });
      navigate(from);
    } catch (e: any) {
      toast({
        title: "로그인 실패",
        description: e?.message || "이메일 또는 비밀번호를 확인해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    // 유효성 검사
    const emailValidation = emailSchema.safeParse(email);
    const passwordValidation = passwordSchema.safeParse(password);

    if (!emailValidation.success) {
      setEmailError(emailValidation.error.errors[0].message);
      return;
    }

    if (!passwordValidation.success) {
      setPasswordError(passwordValidation.error.errors[0].message);
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split("@")[0],
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast({
        title: "회원가입 성공",
        description: "로그인되었습니다.",
      });
      navigate(from);
    } catch (e: any) {
      toast({
        title: "회원가입 실패",
        description: e?.message || "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-3 sm:px-4 py-4 sm:py-6 md:py-8">
      <div className="w-full max-w-md bg-white border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
        <div className="text-center mb-4 sm:mb-5 md:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">새로고침</h1>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-5 md:mb-6 h-10 sm:h-11 md:h-12">
            <TabsTrigger value="login" className="text-sm sm:text-base">로그인</TabsTrigger>
            <TabsTrigger value="signup" className="text-sm sm:text-base">회원가입</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">이메일</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                {emailError && (
                  <p className="text-sm text-red-600">{emailError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">비밀번호</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">이름 (선택)</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">이메일</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                {emailError && (
                  <p className="text-sm text-red-600">{emailError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">비밀번호</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "가입 중..." : "회원가입"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">또는</span>
          </div>
        </div>

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

        <p className="text-xs text-center text-muted-foreground mt-6">
          계속 진행하시면{" "}
          <a href="/terms" className="underline hover:text-foreground">
            이용약관
          </a>{" "}
          및{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            개인정보처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </p>

        {/* 파트너 로그인 연결 버튼 */}
        <div className="border-t pt-6 mt-6">
          <Link to="/partner-login">
            <Button variant="outline" className="w-full h-11 border-accent/50 text-accent hover:bg-accent/5 hover:text-accent">
              <Briefcase className="w-4 h-4 mr-2" />
              전문가이신가요? 파트너로 로그인하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
