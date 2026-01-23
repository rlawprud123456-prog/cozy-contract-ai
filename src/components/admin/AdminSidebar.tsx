import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Settings,
  ShieldCheck,
  HardHat,
  MessageSquare,
  AlertTriangle,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "대시보드", href: "/admin" },
  { icon: Users, label: "회원 관리", href: "/admin/users" },
  { icon: HardHat, label: "파트너 승인/관리", href: "/admin/partners" },
  { icon: MessageSquare, label: "견적 문의 관리", href: "/admin/estimates" },
  { icon: FileText, label: "계약서 관리", href: "/admin/contracts" },
  { icon: ShieldCheck, label: "증빙 패키지 관리", href: "/admin/evidence" },
  { icon: CreditCard, label: "결제/정산", href: "/admin/payments" },
  { icon: AlertTriangle, label: "피해 신고 관리", href: "/admin/damage-reports" },
  { icon: Settings, label: "설정", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-tight">
          Admin Console
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800 ${isActive ? "bg-slate-800 text-white" : ""}`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-slate-800">
          <LogOut className="h-5 w-5" />
          로그아웃
        </Button>
      </div>
    </aside>
  );
}
