import { Link } from "react-router-dom";
import { 
  UserSearch, ShieldCheck, AlertTriangle, Wand2, FileText, 
  Home, MessageSquare, Calculator, FileEdit, FolderOpen,
  Star, Building, HelpCircle, Briefcase, Heart, Users,
  ChevronRight, Settings, LogIn
} from "lucide-react";

const MENU_SECTIONS = [
  {
    title: "전문가 찾기",
    items: [
      { icon: UserSearch, label: "전문가 매칭", path: "/match", desc: "내 조건에 맞는 전문가 찾기" },
      { icon: Building, label: "시공사례 보기", path: "/cases", desc: "실제 시공 사례 둘러보기" },
      { icon: Star, label: "리뷰 보기", path: "/reviews", desc: "고객 후기 확인하기" },
    ]
  },
  {
    title: "견적 · 계약",
    items: [
      { icon: Calculator, label: "AI 견적서 작성", path: "/estimate", desc: "AI가 자동으로 견적서 생성" },
      { icon: FileEdit, label: "계약서 작성", path: "/contract-create", desc: "안전한 전자계약서 작성" },
      { icon: FileText, label: "계약서 AI 검토", path: "/contract-review", desc: "불리한 조항 자동 분석" },
      { icon: FolderOpen, label: "계약 검토 이력", path: "/history", desc: "내 계약 검토 이력 보기" },
    ]
  },
  {
    title: "안전 거래",
    items: [
      { icon: ShieldCheck, label: "안전 에스크로", path: "/escrow", desc: "안전한 대금 결제 시스템" },
      { icon: FileText, label: "증빙 패키지", path: "/evidence-package", desc: "시공 증빙자료 관리" },
    ]
  },
  {
    title: "피해 예방",
    items: [
      { icon: AlertTriangle, label: "피해사례 조회", path: "/scammer-search", desc: "시공사 피해이력 검색" },
      { icon: AlertTriangle, label: "피해 신고", path: "/damage-report", desc: "피해 사례 신고하기" },
      { icon: AlertTriangle, label: "피해 이력", path: "/damage-history", desc: "신고된 피해 목록 보기" },
    ]
  },
  {
    title: "AI 서비스",
    items: [
      { icon: Wand2, label: "AI 인테리어", path: "/ai-interior", desc: "AI로 인테리어 시뮬레이션" },
    ]
  },
  {
    title: "커뮤니티",
    items: [
      { icon: Home, label: "DIY 꿀팁", path: "/community/diy-tips", desc: "셀프 인테리어 노하우" },
      { icon: Heart, label: "자랑해요", path: "/community/sad", desc: "시공 완료 자랑하기" },
      { icon: MessageSquare, label: "억울해요", path: "/community/unfair", desc: "피해 경험 공유" },
      { icon: Briefcase, label: "일자리", path: "/community/jobs", desc: "인테리어 관련 채용" },
      { icon: HelpCircle, label: "질문있어요", path: "/community/help", desc: "궁금한 점 질문하기" },
    ]
  },
  {
    title: "파트너",
    items: [
      { icon: Users, label: "파트너 신청", path: "/partner/apply", desc: "전문가로 등록하기" },
      { icon: Building, label: "파트너 센터", path: "/partner-center", desc: "파트너 전용 관리" },
      { icon: LogIn, label: "파트너 로그인", path: "/partner-login", desc: "파트너 전용 로그인" },
    ]
  },
  {
    title: "내 정보",
    items: [
      { icon: Settings, label: "마이페이지", path: "/profile", desc: "내 정보 관리" },
    ]
  },
];

export default function AllMenu() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="bg-white px-4 py-6 border-b">
        <h1 className="text-xl font-bold text-slate-900">전체 메뉴</h1>
        <p className="text-sm text-gray-500 mt-1">원하는 서비스를 찾아보세요</p>
      </div>

      {/* 메뉴 섹션들 */}
      <div className="p-4 space-y-6">
        {MENU_SECTIONS.map((section, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <h2 className="font-bold text-sm text-slate-700">{section.title}</h2>
            </div>
            <div className="divide-y">
              {section.items.map((item, itemIdx) => (
                <Link 
                  key={itemIdx} 
                  to={item.path}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-slate-900">{item.label}</h3>
                    <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
