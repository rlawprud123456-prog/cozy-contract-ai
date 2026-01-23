import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Phone, Mail, ChevronDown, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Chatbot from "@/components/Chatbot";

export default function SupportPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const faqs = [
    { q: "견적 요청은 무료인가요?", a: "네, 바로고침의 모든 견적 요청 서비스는 100% 무료로 제공됩니다." },
    { q: "에스크로 결제는 어떻게 하나요?", a: "계약서 작성 단계에서 '안전 결제'를 선택하시면 에스크로 계좌가 생성됩니다." },
    { q: "파트너 승인 기준이 궁금해요.", a: "사업자등록증, 실적 증명, 신용도 등을 종합적으로 검토하여 승인합니다." },
    { q: "피해 신고는 어디서 하나요?", a: "전체 메뉴 > 피해 신고 메뉴에서 증빙 자료와 함께 접수해주시면 법률 팀이 검토합니다." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-indigo-700 pb-20">

      {/* 헤더 (배경색 있음) */}
      <div className="px-5 pt-4 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-white">고객센터</h1>
        </div>
        
        <h2 className="text-2xl font-bold text-white leading-tight">
          무엇을 도와드릴까요?
        </h2>

        {/* 검색창 */}
        <div className="relative mt-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="궁금한 내용을 검색해보세요" 
            className="h-14 pl-12 rounded-2xl border-0 bg-white text-slate-900 shadow-xl placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="bg-white min-h-screen rounded-t-[2.5rem] p-6 -mt-2 space-y-6">

        {/* 빠른 문의 버튼 */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-auto py-4 rounded-2xl border-gray-200 flex-col gap-2 hover:border-blue-500 hover:bg-blue-50">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            전화 상담
          </Button>
          <Button variant="outline" className="h-auto py-4 rounded-2xl border-gray-200 flex-col gap-2 hover:border-yellow-500 hover:bg-yellow-50">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-yellow-600" />
            </div>
            카카오톡 문의
          </Button>
        </div>

        {/* FAQ 섹션 */}
        <h3 className="font-bold text-lg text-slate-800 pt-4">자주 묻는 질문</h3>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="border border-gray-100 rounded-xl px-4 data-[state=open]:bg-blue-50/50 data-[state=open]:border-blue-200 transition-all">
              <AccordionTrigger className="text-left font-medium text-sm py-4 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-gray-600 pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        {/* 하단 안내 */}
        <div className="text-center text-xs text-gray-400 pt-6 space-y-1">
          <p>운영시간: 평일 09:00 - 18:00 (주말/공휴일 휴무)</p>
          <p>이메일: tlghkdbstjd@naver.com</p>
        </div>
      </div>
      <Chatbot />
    </div>
  );
}
