import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Chatbot from "@/components/Chatbot";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">

      {/* 1. 세련된 헤더 섹션 (보안 느낌의 짙은 초록/블루 계열) */}
      <div className="relative bg-gradient-to-br from-teal-900 via-emerald-800 to-teal-900 text-white overflow-hidden">

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-400 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
          <Button 
            variant="ghost" 
            className="absolute top-4 left-4 text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> 돌아가기
          </Button>
          <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-200 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            <div className="p-1 bg-white/20 rounded-full">
              <ShieldCheck className="w-4 h-4" />
            </div>
            정보보호
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            개인정보 처리방침
          </h1>
          <p className="text-teal-200 max-w-xl mx-auto leading-relaxed">
            회원님의 소중한 정보, <br/>
            바로고침이 안전하게 지키고 보호하겠습니다.
          </p>
        </div>
      </div>

      {/* 2. 본문 카드 */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <Card className="max-w-4xl mx-auto shadow-2xl border-0 overflow-hidden">
          <div className="bg-white p-6 md:p-10">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <span className="text-sm text-muted-foreground">시행일자: 2026년 1월 23일</span>
              <Badge variant="outline" className="gap-1.5 text-teal-600 border-teal-200 bg-teal-50">
                <Lock className="w-3 h-3" />  보안 연결(SSL) 적용 중
              </Badge>
            </div>

            <ScrollArea className="h-[60vh] pr-4">
              <article className="prose prose-slate max-w-none space-y-8">
                
                {/* 1. 총칙 */}
                <section className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <h2 className="text-lg font-bold text-slate-800 !mt-0">
                    1. 개인정보의 처리 목적
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    바로고침(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                  </p>
                  <div className="flex flex-wrap gap-2 !mt-4 !mb-0">
                    <Badge variant="secondary">회원 가입</Badge>
                    <Badge variant="secondary">견적 매칭</Badge>
                    <Badge variant="secondary">계약 체결</Badge>
                    <Badge variant="secondary">고충 처리</Badge>
                  </div>
                </section>

                {/* 2. 수집 항목 */}
                <section className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <h2 className="text-lg font-bold text-slate-800 !mt-0">
                    2. 수집하는 개인정보의 항목
                  </h2>
                  <div className="text-slate-600 space-y-3 !mb-0">
                    <p className="font-semibold text-teal-700 !mb-1">필수 수집 항목</p>
                    <p className="!mt-0">이름, 휴대전화번호, 이메일, 주소(시공 현장)</p>
                    <br/>
                    <p className="font-semibold text-teal-700 !mb-1">선택 수집 항목</p>
                    <p className="!mt-0">예산, 시공 희망일, 참고용 현장 사진</p>
                  </div>
                </section>

                {/* 3. 보유 기간 */}
                <section className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <h2 className="text-lg font-bold text-slate-800 !mt-0">
                    3. 개인정보의 보유 및 이용 기간
                  </h2>
                  <p className="text-slate-600 mb-4">
                    법령에 따른 개인정보 보유 기간은 다음과 같습니다.
                  </p>
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-semibold text-slate-700">보존 항목</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-slate-700">보존 근거</th>
                          <th className="px-4 py-2.5 text-right font-semibold text-slate-700">기간</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-600">
                        <tr className="border-t border-slate-100">
                          <td className="px-4 py-3">계약/청약철회 기록</td>
                          <td className="px-4 py-3">전자상거래법</td>
                          <td className="px-4 py-3 text-right font-medium">5년</td>
                        </tr>
                        <tr className="border-t border-slate-100 bg-slate-50/50">
                          <td className="px-4 py-3">대금결제/공급 기록</td>
                          <td className="px-4 py-3">전자상거래법</td>
                          <td className="px-4 py-3 text-right font-medium">5년</td>
                        </tr>
                        <tr className="border-t border-slate-100">
                          <td className="px-4 py-3">소비자 불만/분쟁</td>
                          <td className="px-4 py-3">전자상거래법</td>
                          <td className="px-4 py-3 text-right font-medium">3년</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 4. 제3자 제공 */}
                <section className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <h2 className="text-lg font-bold text-slate-800 !mt-0">
                    4. 제3자 제공에 관한 사항
                  </h2>
                  <p className="text-slate-600 leading-relaxed !mb-0">
                    회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 
                    <br/><br/>
                    다만, 견적 상담 및 시공 계약을 위해 회원의 동의 하에 해당 파트너(시공업체)에게 최소한의 정보를 제공할 수 있습니다.
                  </p>
                </section>
                
                <div className="text-center py-6 text-sm text-muted-foreground border-t">
                  <p>개인정보보호책임자: 바로고침 보안팀</p>
                  <p>문의: privacy@barogochim.com</p>
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
