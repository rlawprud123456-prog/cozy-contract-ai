import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, FileText, UserCircle2 } from "lucide-react";
import logo from "@/assets/logo.png";

type SBUser = {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    role?: string;
  };
};

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors ${
    isActive
      ? "text-primary font-semibold"
      : "text-muted-foreground hover:text-foreground"
  }`;

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SBUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // 초기 사용자 정보 가져오기
    supabase.auth.getUser().then(({ data }) => {
      setUser((data.user as any) || null);
    });

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser((session?.user as any) || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (open && !target.closest(".user-menu")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const signInWithKakao = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("카카오 로그인 오류:", error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setOpen(false);
      navigate("/");
    } catch (error) {
      console.error("로그아웃 오류:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <img src={logo} alt="새로고침" className="w-7 h-7" />
          <span className="font-bold text-lg">새로고침</span>
        </Link>

        {/* 네비게이션 (데스크톱) */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={navClass} end>
            홈
          </NavLink>
          <NavLink to="/contract/create" className={navClass}>
            계약작성
          </NavLink>
          <NavLink to="/escrow" className={navClass}>
            에스크로
          </NavLink>
          <NavLink to="/contract-review" className={navClass}>
            계약검토
          </NavLink>
          <NavLink to="/match" className={navClass}>
            전문가매칭
          </NavLink>
          <NavLink to="/partners" className={navClass}>
            파트너
          </NavLink>
        </nav>

        {/* 우측 영역 */}
        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Button variant="outline" onClick={() => navigate("/login")}>
                로그인
              </Button>
              <Button
                className="hidden sm:inline-flex hover:opacity-90 transition"
                onClick={signInWithKakao}
                style={{ backgroundColor: "#FEE500", color: "#111" }}
              >
                카카오로 시작
              </Button>
            </>
          ) : (
            <div className="relative user-menu">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border px-2 py-1 hover:bg-muted transition"
                aria-label="사용자 메뉴"
                aria-expanded={open}
              >
                <img
                  src={
                    user.user_metadata?.avatar_url ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${
                      user.user_metadata?.name || "U"
                    }`
                  }
                  alt="프로필"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="hidden sm:inline text-sm">
                  {user.user_metadata?.name || "사용자"}
                </span>
                <Menu className="w-4 h-4" />
              </button>

              {/* 드롭다운 메뉴 */}
              {open && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border bg-white shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 border-b mb-2">
                    <p className="text-sm font-semibold">
                      {user.user_metadata?.name || "사용자"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/escrow");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-muted text-sm transition"
                  >
                    <FileText className="w-4 h-4" />
                    내 계약서
                  </button>

                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-muted text-sm transition"
                  >
                    <UserCircle2 className="w-4 h-4" />
                    내 정보
                  </button>

                  <div className="my-1 h-px bg-muted" />

                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-red-50 text-sm text-red-600 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
