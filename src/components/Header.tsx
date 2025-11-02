import { NavLink, Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, FileText, Users, User } from "lucide-react";

interface HeaderProps {
  user: any;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const navClass = ({ isActive }: { isActive: boolean }) => 
    isActive 
      ? "text-accent font-semibold transition-colors" 
      : "text-foreground/70 hover:text-accent transition-colors";
  
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-card shadow-[var(--shadow-soft)] border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <Link to="/" className="flex items-center space-x-2 group">
        <img src={logo} alt="새로고침 로고" className="w-10 h-10 object-contain transition-transform group-hover:scale-105" />
        <span className="text-xl font-bold text-primary">새로고침</span>
      </Link>
      <nav className="flex items-center space-x-6">
        <NavLink to="/" className={navClass} end>홈</NavLink>
        
        {/* 계약관리 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-foreground/70 hover:text-accent transition-colors outline-none">
            <FileText className="w-4 h-4" />
            계약관리
            <ChevronDown className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/contract/create" className="cursor-pointer">계약 작성</Link>
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
          <DropdownMenuTrigger className="flex items-center gap-1 text-foreground/70 hover:text-accent transition-colors outline-none">
            <Users className="w-4 h-4" />
            전문가찾기
            <ChevronDown className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/match" className="cursor-pointer">전문가 매칭</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/partners" className="cursor-pointer">파트너 목록</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/scammer-search" className="cursor-pointer">사기범 조회</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <NavLink to="/partner/apply" className={navClass}>파트너신청</NavLink>

        {user ? (
          <>
            {/* 마이페이지 드롭다운 */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-foreground/70 hover:text-accent transition-colors outline-none">
                <User className="w-4 h-4" />
                마이페이지
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/history" className="cursor-pointer">내역 조회</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">프로필</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={onLogout} variant="ghost" size="sm" className="text-foreground/70 hover:text-destructive">
              로그아웃
            </Button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={navClass}>로그인</NavLink>
            <NavLink to="/signup" className={navClass}>회원가입</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
