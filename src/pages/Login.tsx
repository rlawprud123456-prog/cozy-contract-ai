import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LoginProps {
  onLogin: (user: any) => void;
}

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

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user } = await auth.login({ email, password });
      onLogin(user);
      toast({ title: "로그인 성공", description: "환영합니다!" });
      navigate("/");
    } catch (error: any) {
      toast({ title: "로그인 실패", description: error.message, variant: "destructive" });
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
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-card)]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
          <CardDescription className="text-center">
            새로고침 계정으로 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="example@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              로그인
            </Button>
            
            {/* 구분선 */}
            <div className="relative my-4">
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
              className="w-full bg-[#FEE500] text-[#381E1F] hover:bg-[#FDD835] transition-colors disabled:opacity-50"
            >
              <KakaoIcon />
              <span className="ml-2 font-semibold">
                {loading ? "로그인 중..." : "카카오로 시작하기"}
              </span>
            </Button>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              계정이 없으신가요?{" "}
              <Link to="/signup" className="text-accent hover:underline font-medium">
                회원가입
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
