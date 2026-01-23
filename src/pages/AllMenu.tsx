import { useNavigate } from "react-router-dom";
import { 
  User, FileText, Calculator, ShieldCheck, 
  MessageSquare, HelpCircle, Settings, LogOut, 
  ChevronRight, Home, CreditCard, LayoutGrid 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Chatbot from "@/components/Chatbot";

export default function AllMenu() {
  const navigate = useNavigate();

  const menuGroups = [
    {
      title: "필수 서비스",
      items: [
        { icon: Calculator, label: "무료 견적 요청", href: "/contract-create" },
        { icon: LayoutGrid, label: "전문가 찾기", href: "/match" },
        { icon: FileText, label: "계약서 작성", href: "/contract-create" },
        { icon: ShieldCheck, label: "증빙 패키지", href: "/evidence-package" },
      ]
    },
    {
      title: "안전 & 결제",
      items: [
        { icon: ShieldCheck, label: "사기 피해 조회", href: "/damage-history" },
        { icon: CreditCard, label: "에스크로 결제", href: "/escrow" },
        { icon: MessageSquare, label: "피해 신고", href: "/damage-report" },
      ]
    },
    {
      title: "커뮤니티 & 정보",
      items: [
        { icon: Home, label: "시공 사례", href: "/cases" },
        { icon: MessageSquare, label: "커뮤니티", href: "/community" },
        { icon: HelpCircle, label: "고객센터", href: "/support" },
      ]
    }
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30 pb-28">

      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">전체 메뉴</h1>
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
        </Button>
      </div>

      <div className="p-5 space-y-6">

        {/* 로그인/프로필 섹션 (가상의 상태) */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-5 rounded-3xl text-white shadow-xl shadow-blue-500/20" onClick={() => navigate("/profile")}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">내 정보 관리</p>
              <p className="text-sm text-blue-200">프로필 및 설정 수정</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 opacity-70 absolute right-5 top-1/2 -translate-y-1/2" />
        </div>

        {/* 메뉴 그룹 */}
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">{group.title}</p>
            <div className="grid grid-cols-2 gap-3">
              {group.items.map((item, i) => (
                <div key={i} onClick={() => navigate(item.href)}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer active:scale-95"
                >
                  <item.icon className="w-7 h-7 text-blue-600 mb-3" />
                  <p className="font-semibold text-slate-800">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 하단 버튼 */}
        <div className="pt-4 border-t border-gray-200">
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3" /> 로그아웃
          </Button>
        </div>
        
        <p className="text-center text-xs text-gray-400 pt-4">
          버전 1.0.0 • 바로고침 Corp.
        </p>
      </div>
      <Chatbot />
    </div>
  );
}
