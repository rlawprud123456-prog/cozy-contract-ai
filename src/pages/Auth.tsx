import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import logo from "@/assets/logo.png";

const KakaoIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24"
    aria-label="카카오"
  >
    <circle cx="12" cy="12" r="10" fill="#FEE500"/>
    <path 
      d="M12 7c-3.313 0-6 2.134-6 4.767 0 1.7 1.126 3.185 2.835 3.997-.098.375-.355 1.355-.406 1.562-.064.258.095.255.2.186.083-.054 1.33-.905 1.872-1.27.478.07.972.108 1.498.108 3.313 0 6-2.134 6-4.767S15.313 7 12 7z" 
      fill="#381E1F"
    />
  </svg>
);

const signupSchema = z.object({
  name: z.string().trim().min(2, "이름은 최소 2자 이상이어야 합니다").max(50, "이름은 최대 50자까지 입력 가능합니다"),
  email: z.string().trim().email("올바른 이메일 주소를 입력해주세요").max(255, "이메일은 최대 255자까지 입력 가능합니다"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다").max(100, "비밀번호는 최대 100자까지 입력 가능합니다"),
});

const loginSchema = z.object({
  email: z.string().trim().email("올바른 이메일 주소를 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 입력 유효성 검사
      const validatedData = signupSchema.parse({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: validatedData.name,
          }
        }
      });

      if (error) throw error;

      toast({ 
        title: "회원가입 성공", 
        description: "자동으로 로그인되었습니다." 
      });
      navigate("/");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({ 
          title: "입력 오류", 
          description: error.errors[0].message, 
          variant: "destructive" 
        });
      } else {
        const errorMessage = error.message === "User already registered" 
          ? "이미 가입된 이메일입니다" 
          : error.message;
        toast({ 
          title: "회원가입 실패", 
          description: errorMessage, 
          variant: "destructive" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 입력 유효성 검사
      const validatedData = loginSchema.parse({
        email: email.trim(),
        password,
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) throw error;

      toast({ 
        title: "로그인 성공", 
        description: "환영합니다!" 
      });
      navigate("/");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({ 
          title: "입력 오류", 
          description: error.errors[0].message, 
          variant: "destructive" 
        });
      } else {
        const errorMessage = error.message === "Invalid login credentials" 
          ? "이메일 또는 비밀번호가 올바르지 않습니다" 
          : error.message;
        toast({ 
          title: "로그인 실패", 
          description: errorMessage, 
          variant: "destructive" 
        });
      }
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
      toast({
        title: "로그인 실패",
        description: e?.message || "카카오 로그인 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <img src={logo} alt="새로고침 로고" className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-3 sm:mb-4 object-contain" />
          <p className="text-sm sm:text-base text-muted-foreground">안전한 인테리어 계약 플랫폼</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-10 sm:h-12">
            <TabsTrigger value="login" className="text-sm sm:text-base">로그인</TabsTrigger>
            <TabsTrigger value="signup" className="text-sm sm:text-base">회원가입</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <div className="rounded-2xl sm:rounded-3xl bg-card border border-border p-4 sm:p-6 md:p-8">
              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">이메일</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 sm:h-12 rounded-xl sm:rounded-2xl text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium">비밀번호</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 sm:h-12 rounded-xl sm:rounded-2xl text-sm sm:text-base"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 sm:h-12 md:h-14 rounded-full text-sm sm:text-base shadow-[var(--shadow-md)]"
                  disabled={loading}
                >
                  {loading ? "로그인 중..." : "로그인"}
                </Button>
                
                {/* 구분선 */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">또는</span>
                  </div>
                </div>

                {/* 카카오 로그인 버튼 */}
                <Button 
                  type="button"
                  onClick={signInWithKakao} 
                  disabled={loading}
                  className="w-full h-14 rounded-full bg-[#FEE500] text-[#381E1F] hover:bg-[#FDD835] transition-colors disabled:opacity-50 shadow-[var(--shadow-md)]"
                >
                  <KakaoIcon />
                  <span className="ml-2 font-semibold text-base">
                    {loading ? "로그인 중..." : "카카오로 시작하기"}
                  </span>
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="signup">
            <div className="rounded-3xl bg-card border border-border p-8">
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium">이름</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-2xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">이메일</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-2xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">비밀번호</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-2xl"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">최소 6자 이상</p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-full text-base shadow-[var(--shadow-md)]"
                  disabled={loading}
                >
                  {loading ? "가입 중..." : "회원가입"}
                </Button>
                
                {/* 구분선 */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">또는</span>
                  </div>
                </div>

                {/* 카카오 간편 가입 버튼 */}
                <Button 
                  type="button"
                  onClick={signInWithKakao} 
                  disabled={loading}
                  className="w-full h-14 rounded-full bg-[#FEE500] text-[#381E1F] hover:bg-[#FDD835] transition-colors disabled:opacity-50 shadow-[var(--shadow-md)]"
                >
                  <KakaoIcon />
                  <span className="ml-2 font-semibold text-base">
                    {loading ? "가입 중..." : "카카오로 간편가입"}
                  </span>
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
