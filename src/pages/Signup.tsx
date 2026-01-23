import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
    const formatted = value.replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
    setFormData({ ...formData, phone: formatted });
  };

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
    } catch (error: any) {
      toast({ title: "오류", description: error.message, variant: "destructive" });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      toast({ title: "비밀번호 불일치", description: "비밀번호가 일치하지 않습니다.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name, phone: formData.phone },
        },
      });
      if (error) throw error;
      toast({ title: "가입 성공!", description: "로그인해주세요." });
      navigate("/login");
    } catch (error: any) {
      toast({ title: "가입 실패", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 relative">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 text-gray-400 hover:text-gray-600 transition">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mt-8 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle2 className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">환영합니다!</h1>
          </div>
          <p className="text-xl font-semibold text-gray-800">바로고침을 시작해볼까요?</p>
          <p className="text-sm text-gray-500 mt-2">안전한 시공을 위한 첫걸음입니다.</p>
        </div>

        {/* 구글 가입 버튼 */}
        <Button variant="outline" onClick={handleGoogleLogin} className="w-full h-14 rounded-2xl text-lg font-medium border-gray-200 hover:bg-gray-50 mb-6">
          <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 3초 만에 시작하기
        </Button>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-gray-200" />
          <span className="flex-shrink mx-4 text-sm text-gray-400">또는 이메일로 가입</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">이름</label>
            <Input 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="홍길동"
              className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">휴대폰 번호</label>
            <Input 
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              required
              placeholder="010-0000-0000"
              className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">이메일</label>
            <Input 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="user@example.com"
              className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">비밀번호</label>
            <Input 
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="6자 이상 입력"
              className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">비밀번호 확인</label>
            <Input 
              name="passwordConfirm"
              type="password"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              placeholder="비밀번호 재입력"
              className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500"
            />
            {formData.password && formData.password === formData.passwordConfirm && (
              <div className="flex items-center gap-1.5 text-green-600 text-sm pl-1 pt-1">
                <CheckCircle2 className="w-4 h-4" /> 비밀번호가 일치합니다
              </div>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl text-lg font-semibold bg-blue-600 hover:bg-blue-700 mt-6">
            {loading ? "가입 중..." : "회원가입 완료"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          이미 계정이 있으신가요?{" "}
          <button onClick={() => navigate("/login")} className="text-blue-600 font-semibold hover:underline">
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}
