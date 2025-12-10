import { useState } from "react";
import { 
  Phone, MessageCircle, Mail, ChevronDown, ChevronUp, Search, Headphones
} from "lucide-react";
import { AppPage } from "@/components/layout/AppPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const faqCategories = [
  { id: "all", label: "전체" },
  { id: "order", label: "주문/결제" },
  { id: "delivery", label: "배송관련" },
  { id: "cancel", label: "취소/환불" },
  { id: "return", label: "반품/교환" },
  { id: "receipt", label: "증빙서류발급" },
  { id: "account", label: "로그인/회원정보" },
];

const faqData = [
  { id: 1, category: "delivery", question: "배송은 얼마나 걸리나요?", answer: "평균적으로 주문 결제 후 2~3일 이내에 발송됩니다. (공휴일 제외)" },
  { id: 2, category: "order", question: "주문 취소는 어떻게 하나요?", answer: "마이페이지 > 주문내역에서 '배송준비중' 단계 전까지 직접 취소가 가능합니다." },
  { id: 3, category: "return", question: "제품이 불량일 때는?", answer: "제품 수령 후 7일 이내에 사진을 첨부하여 고객센터로 문의주시면 교환/반품을 도와드립니다." },
  { id: 4, category: "account", question: "카카오 계정으로 로그인하면 이미 가입되었다고 합니다.", answer: "이전에 다른 방식으로 가입된 이력이 있는 경우입니다. 이메일 찾기를 이용해주세요." },
  { id: 5, category: "order", question: "주문 내역은 어떻게 확인할 수 있나요?", answer: "상단 메뉴의 [마이페이지] > [주문/배송조회] 메뉴에서 확인하실 수 있습니다." },
  { id: 6, category: "order", question: "결제 방법은 어떤 것이 있나요?", answer: "신용카드, 무통장입금, 카카오페이, 네이버페이 등 다양한 결제 수단을 지원합니다." },
  { id: 7, category: "order", question: "비회원 주문 및 전화주문이 가능한가요?", answer: "비회원 주문은 가능하나, 전화 주문은 보안상의 이유로 지원하지 않습니다." },
];

export default function SupportPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const filteredFaqs = activeCategory === "all" 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory);

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <AppPage title="고객센터" description="무엇을 도와드릴까요? 궁금한 점을 확인해보세요.">
      <div className="space-y-10 pb-10">
        
        <div className="grid md:grid-cols-2 gap-8">
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold">무엇을 도와드릴까요?</h3>
            <ul className="space-y-3">
              {[1, 2, 3, 4].map((id) => {
                const item = faqData.find(f => f.id === id);
                return item ? (
                  <li key={id}>
                    <button 
                      onClick={() => { setActiveCategory(item.category); setOpenFaqId(id); }}
                      className="flex items-center text-muted-foreground hover:text-primary hover:underline text-left text-sm"
                    >
                      <Search className="w-4 h-4 mr-2 text-primary" />
                      {item.question}
                    </button>
                  </li>
                ) : null;
              })}
            </ul>
          </div>

          <Card className="bg-secondary/30 border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">고객센터 <span className="text-primary text-xl ml-1">1670-0876</span></h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    평일: 09:00 ~ 18:00 (점심시간 12:00 ~ 13:00)<br/>
                    주말/공휴일: 휴무
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button className="w-full bg-[#FAE100] hover:bg-[#F9E000]/90 text-black border-none">
                  <MessageCircle className="w-4 h-4 mr-2" /> 카카오톡 상담
                </Button>
                <Button variant="outline" className="w-full bg-background">
                  <Mail className="w-4 h-4 mr-2" /> 이메일 문의
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-6">
          
          <div className="flex flex-wrap gap-2">
            {faqCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.id)}
                className="rounded-full"
                size="sm"
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <div key={faq.id} className="border-b border-border last:border-0">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="flex w-full justify-between items-center py-5 px-2 hover:bg-secondary/50 text-left transition-colors rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-primary font-bold shrink-0">Q</span>
                      <span className={`text-sm md:text-base ${openFaqId === faq.id ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                        {faq.question}
                      </span>
                    </div>
                    {openFaqId === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  {openFaqId === faq.id && (
                    <div className="bg-secondary/50 p-6 rounded-lg mb-4 text-sm text-foreground leading-relaxed animate-in slide-in-from-top-2 duration-200">
                       <span className="font-bold text-muted-foreground mr-2">A.</span>
                       {faq.answer}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                해당 카테고리의 질문이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppPage>
  );
}
