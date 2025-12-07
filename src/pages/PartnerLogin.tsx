import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Briefcase } from "lucide-react";

export default function PartnerLogin() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handlePartnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 기본 로그인 시도
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. 파트너 여부 확인
      if (authData.user) {
        const { data: partnerData, error: partnerError } = await supabase
          .from("partners")
          .select("status")
          .eq("user_id", authData.user.id)
          .single();

        if (partnerError || !partnerData) {
          // 파트너가 아님 -> 로그아웃 시키고 경고
          await supabase.auth.signOut();
          toast({
            title: "파트너 계정이 아닙니다",
            description: "일반 회원은 일반 로그인을 이용해주세요. 또는 파트너 신청이 필요합니다.",
            variant: "destructive",
          });
          return;
        }

        if (partnerData.status === 'pending') {
          toast({
            title: "심사 중입니다",
            description: "관리자 승인 대기 중입니다. 승인 후 이용 가능합니다.",
          });
          // 대기 상태에서도 센터 진입을 막으려면 return
        }

        toast({
          title: "파트너 로그인 성공",
          description: "파트너 센터로 이동합니다.",
        });
        navigate("/partner-center");
      }

    } catch (e: any) {
      toast({
        title: "로그인 실패",
        description: "이메일 또는 비밀번호를 확인해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
            <Briefcase className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">파트너 로그인</h1>
          <p className="text-sm text-muted-foreground mt-2">전문가 전용 페이지입니다</p>
        </div>

        <form onSubmit={handlePartnerLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">파트너 이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="partner@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-11"
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
              disabled={loading}
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11"
            disabled={loading}
          >
            {loading ? "확인 중..." : "로그인"}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            아직 파트너가 아니신가요?{" "}
            <Link to="/partner/apply" className="text-accent hover:underline font-medium">
              파트너 신청하기
            </Link>
          </p>
          <div className="pt-4 border-t">
            <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground">
              일반 사용자 로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
