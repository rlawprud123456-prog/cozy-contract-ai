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

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="새로고침 로고" className="w-40 h-40 mx-auto mb-4 object-contain" />
          <p className="text-muted-foreground">안전한 인테리어 계약 플랫폼</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <div className="rounded-3xl bg-card border border-border p-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">이메일</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-2xl"
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
                    className="h-12 rounded-2xl"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-full text-base shadow-[var(--shadow-md)]"
                  disabled={loading}
                >
                  {loading ? "로그인 중..." : "로그인"}
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
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
