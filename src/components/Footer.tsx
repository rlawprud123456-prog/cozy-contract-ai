import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* 브랜드 정보 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">바로고침</h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              안전한 인테리어 계약의 시작.<br/>
              AI 기술과 에스크로 결제로 투명하고 공정한<br/>
              리모델링 문화를 만들어갑니다.
            </p>
          </div>
          
          {/* 바로가기 */}
          <div>
            <h4 className="font-semibold text-white mb-4">바로가기</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/match" className="hover:text-blue-400 transition">전문가 찾기</Link></li>
              <li><Link to="/contract-create" className="hover:text-blue-400 transition">무료 견적/계약</Link></li>
              <li><Link to="/partner/apply" className="hover:text-blue-400 transition">파트너 신청</Link></li>
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h4 className="font-semibold text-white mb-4">고객지원</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/community/help" className="hover:text-blue-400 transition">문의하기</Link></li>
              <li><Link to="/faq" className="hover:text-blue-400 transition">자주 묻는 질문</Link></li>
            </ul>
          </div>
        </div>

        {/* 하단 정보 & 약관 */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-white transition font-medium">이용약관</Link>
            <Link to="/privacy" className="hover:text-white transition font-bold text-gray-300">개인정보처리방침</Link>
          </div>
          <div className="text-center md:text-right">
            <p className="mb-1">대표: 사용자님 | 협력사: (주)명광</p>
            <p>© 2026 바로고침. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
