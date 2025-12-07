import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShieldCheck, User, MessageSquare } from "lucide-react";

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const MENUS = [
    { icon: Home, label: "홈", path: "/" },
    { icon: Search, label: "찾기", path: "/match" },
    { icon: ShieldCheck, label: "안전보호", path: "/escrow" },
    { icon: MessageSquare, label: "커뮤니티", path: "/community/diy-tips" },
    { icon: User, label: "마이", path: "/profile" },
  ];

  // 로그인/회원가입 페이지 등에서는 숨기기
  if (["/login", "/signup", "/partner-login"].includes(path)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden pb-safe">
      <div className="flex justify-between items-center px-6 h-16">
        {MENUS.map((menu) => {
          const isActive = path === menu.path || (menu.path !== "/" && path.startsWith(menu.path));
          return (
            <Link 
              key={menu.path} 
              to={menu.path} 
              className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${
                isActive ? "text-slate-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <menu.icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{menu.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
