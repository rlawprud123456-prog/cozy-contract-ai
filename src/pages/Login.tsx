import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Building2, User } from "lucide-react";
import Chatbot from "@/components/Chatbot";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<"user" | "partner">("user");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (userType === "partner") {
        const { data: partner } = await supabase
          .from("partners")
          .select("status")
          .eq("user_id", data.user.id)
          .single();

        if (!partner) {
          toast({ title: "파트너 계정이 아닙니다", description: "먼저 파트너 신청을 해주세요.", variant: "destructive" });
          navigate("/partner/apply");
          return;
        }
        if (partner.status === 'pending') {
          toast({ title: "승인 대기 중", description: "관리자 승인을 기다리는 중입니다." });
          navigate("/partner/apply");
          return;
        }
        navigate("/partner-center");
      } else {
        navigate("/");
      }
      toast({ title: "환영합니다!", description: "성공적으로 로그인되었습니다." });

    } catch (error: any) {
      toast({ title: "로그인 실패", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 relative overflow-hidden">

      {/* 배경 데코레이션 (은은하게) */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      
      <div className="relative w-full max-w-5xl grid md:grid-cols-2 gap-8 lg:gap-16 items-center z-10">
        
        {/* 왼쪽: 브랜드 메시지 (데스크탑 전용) */}
        <div className="hidden md:flex flex-col justify-center space-y-8 p-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              안전한 인테리어,<br />
              바로고침에서<br />
              시작하세요.
            </h1>
            <p className="text-lg text-slate-500">
              계약부터 시공, 결제까지.<br />
              모든 과정이 투명하게 기록됩니다.
            </p>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">3초 만에</p>
                <p className="font-bold text-slate-700">계약서 분석</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">먹튀 걱정 없는</p>
                <p className="font-bold text-slate-700">에스크로 결제</p>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 로그인 폼 (토스 스타일) */}
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 space-y-6">
          <div className="text-center">
             <h2 className="text-2xl font-bold text-slate-900">안녕하세요 👋</h2>
             <p className="text-slate-500 mt-1">서비스 이용을 위해 로그인해주세요.</p>
          </div>

          {/* 1. 회원 유형 선택 탭 (토스 스타일 토글) */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex relative">
            <div 
              className={`absolute top-1.5 h-[calc(100%-12px)] w-[calc(50%-6px)] bg-white rounded-xl shadow-md transition-all duration-300 ease-out ${userType === 'partner' ? 'left-[calc(50%+3px)]' : 'left-1.5'}`}
            />
            <button 
              onClick={() => setUserType("user")}
              className={`flex-1 relative z-10 py-3 text-sm font-bold transition-colors ${userType === "user" ? "text-slate-900" : "text-gray-400"}`}
            >
              일반 회원
            </button>
            <button 
              onClick={() => setUserType("partner")}
              className={`flex-1 relative z-10 py-3 text-sm font-bold transition-colors ${userType === "partner" ? "text-slate-900" : "text-gray-400"}`}
            >
              파트너 (전문가)
            </button>
          </div>

          {/* 2. 입력 폼 */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 pl-1">이메일</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="example@email.com" 
                className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 text-lg px-4 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 pl-1">비밀번호</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="비밀번호 입력" 
                className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 text-lg px-4 transition-all"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl text-lg font-bold bg-slate-900 hover:bg-slate-800 transition-transform active:scale-[0.98]">
              {loading ? "확인하는 중..." : "로그인하기"} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          {/* 3. 하단 링크 */}
          <div className="flex items-center justify-center gap-4 text-sm text-slate-400 pt-2">
            <button className="hover:text-slate-600 transition">아이디 찾기</button>
            <span>|</span>
            <button className="hover:text-slate-600 transition">비밀번호 찾기</button>
            <span>|</span>
            <button 
              onClick={() => navigate("/signup")}
              className="hover:text-blue-600 font-semibold transition"
            >
              회원가입
            </button>
          </div>
          
          {userType === 'partner' && (
            <div className="text-center pt-4 border-t border-slate-100 space-y-1">
              <p className="text-sm text-slate-500">아직 바로고침 파트너가 아니신가요?</p>
              <button 
                onClick={() => navigate("/partner/apply")}
                className="text-sm font-bold text-blue-700 underline decoration-2 underline-offset-2 hover:text-blue-800"
              >
                파트너 입점 신청하러 가기
              </button>
            </div>
          )}
        </div>
      </div>
      <Chatbot />
    </div>
  );
}
