import { NavLink, Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

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
        <NavLink to="/review" className={navClass}>계약검토</NavLink>
        <NavLink to="/match" className={navClass}>전문가매칭</NavLink>
        <NavLink to="/partners" className={navClass}>파트너</NavLink>
        <NavLink to="/scam" className={navClass}>사기조회</NavLink>
        {user ? (
          <>
            <NavLink to="/profile" className={navClass}>프로필</NavLink>
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
