import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: "로그인 실패", description: error.message, variant: "destructive" });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      toast({ title: "환영합니다!", description: "성공적으로 로그인되었습니다." });
      navigate("/");
    } catch (error: any) {
      toast({ title: "로그인 실패", description: "이메일 또는 비밀번호를 확인해주세요.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* 왼쪽: 감각적인 인테리어 이미지 */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-40" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              공간의 가치를<br/>높이는 기술
            </h1>
            <p className="text-lg text-white/80">
              투명한 견적, 안전한 결제.<br/>
              바로고침이 새로운 인테리어 기준을 만듭니다.
            </p>
          </div>
        </div>
      </div>

      {/* 오른쪽: 로그인 폼 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">안녕하세요 👋</h2>
            <p className="mt-2 text-gray-500">서비스 이용을 위해 로그인해주세요.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">이메일</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="user@example.com" 
                className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 text-lg px-4 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">비밀번호</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="비밀번호 입력" 
                className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 text-lg px-4 transition-all"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl text-lg font-semibold bg-blue-600 hover:bg-blue-700">
              {loading ? "확인 중..." : "이메일로 로그인"} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          {/* 구분선 */}
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-200" />
            <span className="flex-shrink mx-4 text-sm text-gray-400">또는</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {/* 구글 로그인 버튼 */}
          <Button variant="outline" onClick={handleGoogleLogin} className="w-full h-14 rounded-2xl text-lg font-medium border-gray-200 hover:bg-gray-50">
            <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 시작하기
          </Button>

          {/* 하단 링크 */}
          <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
            <button className="hover:text-blue-600 transition">비밀번호 찾기</button>
            <span>|</span>
            <button onClick={() => navigate("/signup")} className="hover:text-blue-600 font-semibold transition">회원가입</button>
          </div>
        </div>
      </div>
    </div>
  );
}
