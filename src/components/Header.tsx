import { NavLink, Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, FileText, Users, User, MessageSquare, AlertTriangle } from "lucide-react";

interface HeaderProps {
  user: any;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const navClass = ({ isActive }: { isActive: boolean }) => 
    isActive 
      ? "text-primary font-semibold transition-colors text-sm" 
      : "text-muted-foreground hover:text-foreground transition-colors text-sm";
  
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-background border-b border-border sticky top-0 z-50 backdrop-blur-lg bg-background/80">
      <Link to="/" className="flex items-center space-x-2 group">
        <img src={logo} alt="새로고침 로고" className="w-9 h-9 object-contain" />
        <span className="text-xl font-bold text-foreground">새로고침</span>
      </Link>
      <nav className="flex items-center space-x-5">
        <NavLink to="/" className={navClass} end>홈</NavLink>
        
        {/* 계약관리 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors outline-none text-sm">
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
          <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors outline-none text-sm">
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
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 피해이력 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors outline-none text-sm">
            <AlertTriangle className="w-4 h-4" />
            피해이력
            <ChevronDown className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
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
          <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors outline-none text-sm">
            <MessageSquare className="w-4 h-4" />
            커뮤니티
            <ChevronDown className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/community/sad" className="cursor-pointer">속상해요</Link>
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
        
        <NavLink to="/partner/apply" className={navClass}>파트너신청</NavLink>

        {user ? (
          <>
            {/* 마이페이지 드롭다운 */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors outline-none text-sm">
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
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="cursor-pointer">관리자</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={onLogout} variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive text-sm">
              로그아웃
            </Button>
          </>
        ) : (
          <>
            <NavLink to="/auth" className={navClass}>로그인</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
