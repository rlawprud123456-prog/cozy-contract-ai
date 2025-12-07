import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin, isPartner, getPartnerStatus } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePartner?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requirePartner = false 
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/login");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // 관리자 페이지 접근 확인
      if (requireAdmin) {
        const adminCheck = await isAdmin(user.id);
        if (!adminCheck) {
          setRedirectPath("/");
          setAuthorized(false);
          setLoading(false);
          return;
        }
      }

      // 파트너 페이지 접근 확인
      if (requirePartner) {
        const partnerCheck = await isPartner(user.id);
        if (!partnerCheck) {
          setRedirectPath("/partner-login");
          setAuthorized(false);
          setLoading(false);
          return;
        }

        // 파트너 승인 상태 확인 (선택적)
        const status = await getPartnerStatus(user.id);
        if (status === "pending") {
          // pending 상태도 접근은 허용하되 UI에서 처리
        }
      }

      setAuthorized(true);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setAuthorized(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [requireAdmin, requirePartner]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
