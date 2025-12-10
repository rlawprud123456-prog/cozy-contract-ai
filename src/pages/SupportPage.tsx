import { useState } from "react";
import { 
  MessageCircle, Mail, Search, AlertCircle
} from "lucide-react";
import { AppPage } from "@/components/layout/AppPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [];

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
    <AppPage title="고객센터" description="궁금한 점을 확인해보세요.">
      <div className="space-y-10 pb-10">
        
        <div className="grid md:grid-cols-2 gap-8">
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold">자주 묻는 질문</h3>
            <div className="bg-secondary/50 p-4 rounded-lg text-muted-foreground flex items-center">
              <Search className="w-5 h-5 mr-2 opacity-50" />
              <span>아직 등록된 빠른 질문이 없습니다.</span>
            </div>
          </div>

          <Card className="bg-secondary/30 border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-lg">고객센터 안내</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    운영 준비 중입니다.<br/>
                    하단의 버튼을 통해 문의를 남겨주세요.
                  </p>
                </div>
                <AlertCircle className="text-muted-foreground/30 w-8 h-8" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button className="w-full" disabled>
                  <MessageCircle className="w-4 h-4 mr-2" /> 채팅 상담
                </Button>
                <Button variant="outline" className="w-full bg-background" disabled>
                  <Mail className="w-4 h-4 mr-2" /> 이메일 문의
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-6">
          
          <div className="flex flex-wrap gap-2">
            <Button variant="default" size="sm" className="rounded-full">전체</Button>
          </div>

          <div className="border-t border-border pt-6 text-center">
             <div className="py-16 flex flex-col items-center justify-center text-muted-foreground bg-secondary/30 rounded-lg">
                <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">등록된 자주 묻는 질문이 없습니다.</p>
                <p className="text-sm mt-1">서비스 준비 중입니다.</p>
             </div>
          </div>

        </div>
      </div>
    </AppPage>
  );
}
