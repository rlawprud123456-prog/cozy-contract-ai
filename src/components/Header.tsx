import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, LogOut, FileText, UserCircle2, ChevronDown, Users, AlertTriangle, MessageSquare, Calculator } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        {/* 모바일 메뉴 버튼 */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Link 
                to="/" 
                className="text-lg font-semibold hover:text-primary transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                홈
              </Link>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Calculator className="w-4 h-4" />
                  견적
                </div>
                <Link 
                  to="/estimate" 
                  className="block pl-6 text-base hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  견적서 작성
                </Link>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  계약관리
                </div>
                <Link 
                  to="/contract-create" 
                  className="block pl-6 text-base hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  계약 작성
                </Link>
                <Link 
                  to="/contract-review" 
                  className="block pl-6 text-base hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  계약 검토
                </Link>
                <Link 
                  to="/escrow" 
                  className="block pl-6 text-base hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  에스크로
                </Link>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Users className="w-4 h-4" />
                  전문가찾기
                </div>
                <Link 
                  to="/match" 
                  className="block pl-6 text-base hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  전문가 매칭
                </Link>
                <Link 
                  to="/partners" 
                  className="block pl-6 text-base hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  파트너 목록
                </Link>
                <Link 
                  to="/reviews" 
                  className="block pl-6 text-base hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  고객 리뷰
                </Link>
                <Link 
                  to="/partner/apply" 
                  className="block pl-6 text-base hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  파트너 신청
                </Link>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <AlertTriangle className="w-4 h-4" />
                  피해이력
                </div>
                <Link 
                  to="/damage-history" 
                  className="block pl-6 text-base hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  피해이력 조회
                </Link>
                <Link 
                  to="/damage-report" 
                  className="block pl-6 text-base hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  피해신고
                </Link>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  커뮤니티
                </div>
                <Link 
                  to="/community/sad" 
                  className="block pl-6 text-base hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  속상해요
                </Link>
                <Link 
                  to="/community/unfair" 
                  className="block pl-6 text-base hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  억울해요
                </Link>
                <Link 
                  to="/community/diy-tips" 
                  className="block pl-6 text-base hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  셀프인테리어 팁
                </Link>
                <Link 
                  to="/community/jobs" 
                  className="block pl-6 text-base hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  구인구직
                </Link>
                <Link 
                  to="/community/help" 
                  className="block pl-6 text-base hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  고수님 도와주세요
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <img src={logo} alt="새로고침" className="w-7 h-7" />
          <span className="font-bold text-lg">새로고침</span>
        </Link>

        {/* 네비게이션 (데스크톱) */}
        <nav className="hidden md:flex items-center gap-5">
          <NavLink to="/" className={navClass} end>
            홈
          </NavLink>
          
          {/* 견적 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors outline-none">
              <Calculator className="w-4 h-4" />
              견적
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white">
              <DropdownMenuItem asChild>
                <Link to="/estimate" className="cursor-pointer">견적서 작성</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 계약관리 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors outline-none">
              <FileText className="w-4 h-4" />
              계약관리
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white">
              <DropdownMenuItem asChild>
                <Link to="/contract-create" className="cursor-pointer">계약 작성</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/contract-review" className="cursor-pointer">계약 검토</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/escrow" className="cursor-pointer">에스크로</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 전문가찾기 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors outline-none">
              <Users className="w-4 h-4" />
              전문가찾기
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white">
              <DropdownMenuItem asChild>
                <Link to="/match" className="cursor-pointer">전문가 매칭</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/partners" className="cursor-pointer">파트너 목록</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/reviews" className="cursor-pointer">고객 리뷰</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/partner/apply" className="cursor-pointer">파트너 신청</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 피해이력 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors outline-none">
              <AlertTriangle className="w-4 h-4" />
              피해이력
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white">
              <DropdownMenuItem asChild>
                <Link to="/damage-history" className="cursor-pointer">피해이력 조회</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/damage-report" className="cursor-pointer">피해신고</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* 커뮤니티 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors outline-none">
              <MessageSquare className="w-4 h-4" />
              커뮤니티
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white">
              <DropdownMenuItem asChild>
                <Link to="/community/sad" className="cursor-pointer">속상해요</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/community/unfair" className="cursor-pointer">억울해요</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/community/diy-tips" className="cursor-pointer">셀프인테리어 팁</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/community/jobs" className="cursor-pointer">구인구직</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/community/help" className="cursor-pointer">고수님 도와주세요</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                      navigate("/history");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-muted text-sm transition"
                  >
                    <FileText className="w-4 h-4" />
                    내역 조회
                  </button>

                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-muted text-sm transition"
                  >
                    <UserCircle2 className="w-4 h-4" />
                    프로필
                  </button>

                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/admin");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-muted text-sm transition"
                  >
                    <UserCircle2 className="w-4 h-4" />
                    관리자
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
