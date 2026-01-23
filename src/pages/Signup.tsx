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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.passwordConfirm) {
      toast({ title: "비밀번호 불일치", description: "비밀번호가 서로 다릅니다.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "가입 성공!",
        description: "환영합니다! 이제 로그인해주세요.",
      });
      navigate("/login");

    } catch (error: any) {
      toast({ title: "가입 실패", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 z-10">
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 text-gray-400 hover:text-gray-600 transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl font-bold text-slate-900">
            환영합니다!<br />
            바로고침을 시작해볼까요?
          </h1>
          <p className="text-slate-500 mt-2">안전한 시공을 위한 첫걸음입니다.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 pl-1">이름</label>
            <Input 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="홍길동"
              className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 text-lg px-4 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 pl-1">휴대폰 번호</label>
            <Input 
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              required
              placeholder="010-1234-5678"
              className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 text-lg px-4 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 pl-1">이메일 (아이디)</label>
            <Input 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 text-lg px-4 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 pl-1">비밀번호</label>
            <Input 
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="6자 이상 입력"
              className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 text-lg px-4 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 pl-1">비밀번호 확인</label>
            <Input 
              name="passwordConfirm"
              type="password"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              placeholder="비밀번호 재입력"
              className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 text-lg px-4 transition-all"
            />
            {formData.password && formData.password === formData.passwordConfirm && (
              <div className="flex items-center gap-1.5 text-green-600 text-sm pl-1 pt-1">
                <CheckCircle2 className="w-4 h-4" /> 비밀번호가 일치합니다
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-14 rounded-2xl text-lg font-bold bg-slate-900 hover:bg-slate-800 transition-transform active:scale-[0.98] mt-4"
          >
            {loading ? "가입 처리 중..." : "동의하고 가입하기"}
          </Button>
        </form>
      </div>
    </div>
  );
}
