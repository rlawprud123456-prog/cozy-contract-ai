import { ArrowLeft, Scale, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Chatbot from "@/components/Chatbot";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">

      {/* 1. 세련된 헤더 섹션 */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
          <Button 
            variant="ghost" 
            className="absolute top-4 left-4 text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> 돌아가기
          </Button>
          <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            <div className="p-1 bg-white/20 rounded-full">
              <Scale className="w-4 h-4" />
            </div>
            서비스 운영 정책
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            바로고침 서비스 이용약관
          </h1>
          <p className="text-slate-300 max-w-xl mx-auto leading-relaxed">
            투명하고 공정한 인테리어 문화를 만들기 위한<br/>
            바로고침과 회원님 간의 약속입니다.
          </p>
        </div>
      </div>

      {/* 2. 약관 본문 카드 */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <Card className="max-w-4xl mx-auto shadow-2xl border-0 overflow-hidden">
          <div className="bg-white p-6 md:p-10">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <span className="text-sm text-muted-foreground">최종 개정일: 2026년 1월 23일</span>
              <Badge variant="outline" className="gap-1.5 text-emerald-600 border-emerald-200 bg-emerald-50">
                <CheckCircle2 className="w-3 h-3" /> v1.0 시행 중
              </Badge>
            </div>

            <ScrollArea className="h-[60vh] pr-4">
              <article className="prose prose-slate max-w-none space-y-8">
                
                {/* 제1조 */}
                <section className="p-5 bg-slate-50 rounded-xl">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 !mt-0">
                    <span className="w-7 h-7 flex items-center justify-center bg-slate-800 text-white rounded-full text-sm">1</span>
                    제1조 (목적)
                  </h2>
                  <p className="text-slate-600 leading-relaxed !mb-0">
                    본 약관은 바로고침(이하 "회사")이 제공하는 인테리어 중개 및 안전 결제 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
                  </p>
                </section>

                {/* 제2조 */}
                <section className="p-5 bg-slate-50 rounded-xl">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 !mt-0">
                    <span className="w-7 h-7 flex items-center justify-center bg-slate-800 text-white rounded-full text-sm">2</span>
                    제2조 (용어의 정의)
                  </h2>
                  <ul className="space-y-3 text-slate-600 list-none !pl-0 !mb-0">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      "서비스"란 회사가 웹사이트를 통해 제공하는 인테리어 업체 매칭, 계약 관리, 에스크로 결제 등의 제반 서비스를 의미합니다.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      "회원"이란 본 약관에 동의하고 회사에 개인정보를 제공하여 회원등록을 한 자를 말합니다.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      "파트너"란 회사 승인을 받아 시공 서비스를 제공하는 인테리어 업체를 의미합니다.
                    </li>
                  </ul>
                </section>

                {/* 제3조 */}
                <section className="p-5 bg-slate-50 rounded-xl">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 !mt-0">
                    <span className="w-7 h-7 flex items-center justify-center bg-slate-800 text-white rounded-full text-sm">3</span>
                    제3조 (서비스의 제공)
                  </h2>
                  <p className="text-slate-600 mb-4">회사는 회원에게 다음과 같은 서비스를 제공합니다.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-slate-800 text-sm mb-1">견적 중개</h4>
                      <p className="text-xs text-slate-500 !mb-0">시공 업체 매칭 및 비교 견적</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-slate-800 text-sm mb-1">AI 계약 분석</h4>
                      <p className="text-xs text-slate-500 !mb-0">표준 계약서 자동 생성 및 리스크 분석</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-slate-800 text-sm mb-1">에스크로</h4>
                      <p className="text-xs text-slate-500 !mb-0">공사 대금 예치 및 단계별 지급</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-slate-800 text-sm mb-1">정보 제공</h4>
                      <p className="text-xs text-slate-500 !mb-0">시공 사례 및 파트너 평판 정보</p>
                    </div>
                  </div>
                </section>

                {/* 제4조 */}
                <section className="p-5 bg-slate-50 rounded-xl">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 !mt-0">
                    <span className="w-7 h-7 flex items-center justify-center bg-slate-800 text-white rounded-full text-sm">4</span>
                    제4조 (책임의 한계)
                  </h2>
                  <p className="text-slate-600 leading-relaxed !mb-0">
                    회사는 파트너와 회원 간의 거래를 중개하는 플랫폼 서비스 제공자로서, 파트너가 제공하는 시공 용역의 품질이나 하자 등에 대하여 직접적인 책임을 지지 않습니다. 
                    <br /><br />
                    단, 회사가 제공하는 에스크로 정책에 따른 대금 보호 의무는 예외로 하며, 분쟁 발생 시 중재를 위해 최선을 다합니다.
                  </p>
                </section>
                
                <div className="text-center py-6 text-sm text-muted-foreground border-t">
                  <p>본 약관과 관련하여 문의사항이 있으신 경우 고객센터로 연락주시기 바랍니다.</p>
                </div>
              </article>
            </ScrollArea>
          </div>
        </Card>
      </div>
      <Chatbot />
    </div>
  );
}
