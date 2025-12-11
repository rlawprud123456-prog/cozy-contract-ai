import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Bot, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// 페이지별 추천 질문 데이터
const CONTEXT_QUESTIONS: Record<string, string[]> = {
  "/estimate": ["평당 견적은 얼마인가요?", "추가 비용은 없나요?", "견적 비교 팁 알려줘"],
  "/contract-create": ["특약 사항 추천해줘", "지체상금 비율은?", "계약금 얼마가 적당해?"],
  "/escrow": ["에스크로 수수료는?", "결제는 언제 넘어가나요?", "먹튀 방지되나요?"],
  "/match": ["좋은 업체 고르는 법", "A/S 보증 기간은?", "포트폴리오 보는 법"],
};

const DEFAULT_QUESTIONS = [
  "선금 비율은 얼마가 적정한가요?",
  "표준 계약서 양식이 있나요?",
  "하자보수 기간은 보통 몇 년?",
  "사기꾼 조회는 어떻게 해요?"
];

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
  isLoading?: boolean;
}

export default function Chatbot() {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      role: "bot", 
      text: "안녕하세요! 🏠\n안전한 인테리어 계약을 도와드리는 코지봇입니다.\n무엇을 도와드릴까요?" 
    }
  ]);

  // 현재 페이지에 맞는 추천 질문 보여주기
  const currentQuestions = CONTEXT_QUESTIONS[location.pathname] || DEFAULT_QUESTIONS;

  // 메시지 추가될 때마다 스크롤 아래로 이동
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // AI 응답 생성 로직 (나중에 실제 API로 교체할 부분)
  const generateAIResponse = async (userText: string) => {
    const lower = userText.toLowerCase();
    
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000)); // 생각하는 척 딜레이

    if (lower.includes("선금") || lower.includes("계약금")) 
      return "💰 **선금 가이드**\n\n통상적으로 총 공사비의 10~20%가 적당합니다. 50% 이상 요구하는 경우 위험할 수 있으니 에스크로 결제를 적극 권장드립니다.";
    
    if (lower.includes("중도금")) 
      return "💸 **중도금 지급 팁**\n\n철거 완료 시 30%, 목공 완료 시 30% 등 공정률에 따라 나눠서 지급하는 것이 가장 안전합니다.";
    
    if (lower.includes("하자") || lower.includes("as")) 
      return "🛠 **하자보수(A/S)**\n\n실내건축공사업법상 최소 1년은 의무입니다. 계약서에 '하자보수이행증권' 발행 여부를 꼭 특약으로 넣으세요!";
    
    if (lower.includes("견적") || lower.includes("비용")) 
      return "📊 **견적 문의**\n\n평당 150~200만원(국민평수 기준)이 평균적입니다. 정확한 금액은 [견적 페이지](/estimate)에서 무료로 계산해보세요!";

    if (lower.includes("사기") || lower.includes("조회")) 
      return "🚨 **사기 피해 예방**\n\n업체의 사업자등록증과 통장 명의가 일치하는지 꼭 확인하세요. [사기꾼 조회](/scammer-search) 메뉴에서 연락처를 검색해보실 수 있습니다.";

    if (lower.includes("안녕"))
      return "반갑습니다! 오늘도 안전한 계약 되세요. 😊";

    return "죄송해요, 아직 배우고 있는 중이라 정확히 이해하지 못했어요. 😅\n\n'선금', '견적', '하자보수' 같은 핵심 단어로 질문해 주시면 더 잘 답변드릴 수 있어요!";
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    // 1. 사용자 메시지 추가
    const userMsg: Message = { id: Date.now(), role: "user", text: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // 2. AI 응답 생성
      const replyText = await generateAIResponse(messageText);
      
      // 3. 봇 메시지 추가
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "bot", text: replyText }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "bot", text: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setMessages([{ 
      id: 1, 
      role: "bot", 
      text: "대화가 초기화되었습니다. \n새로운 궁금증이 있으신가요?" 
    }]);
  };

  // 링크 클릭 처리 (답변 내 [] 링크 지원)
  const renderMessageText = (text: string) => {
    // Markdown 스타일 링크 [텍스트](주소) 파싱
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <span 
          key={match.index} 
          onClick={() => navigate(match[2])}
          className="text-primary font-semibold cursor-pointer hover:underline"
        >
          {match[1]}
        </span>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="z-[9999]">
      {/* 1. 플로팅 버튼 */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 md:bottom-8 right-6 bg-primary text-primary-foreground rounded-full p-4 shadow-xl hover:scale-105 transition-all duration-300 hover:shadow-2xl z-50 group"
        >
          <MessageCircle className="w-6 h-6 group-hover:animate-bounce" />
          <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
            AI
          </span>
        </button>
      )}

      {/* 2. 챗봇 윈도우 */}
      {open && (
        <div className="fixed bottom-24 md:bottom-8 right-6 w-[340px] md:w-[380px] bg-background border border-border/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* 헤더 */}
          <div className="flex items-center justify-between bg-primary text-primary-foreground px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="bg-background/10 p-1.5 rounded-lg">
                <Bot className="w-5 h-5 text-accent" />
              </div>
              <div>
                <span className="font-bold text-sm block">코지봇 AI</span>
                <span className="text-[10px] text-primary-foreground/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> 
                  운영중
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleRefresh} className="p-2 hover:bg-background/10 rounded-full transition text-primary-foreground/70">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-background/10 rounded-full transition text-primary-foreground/70">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div 
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto bg-muted/30 space-y-4 min-h-[350px] max-h-[500px]"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "bot" && (
                  <Avatar className="w-8 h-8 border bg-background mt-1 shrink-0">
                    <AvatarImage src="/bot-avatar.png" />
                    <AvatarFallback><Bot className="w-5 h-5 text-primary" /></AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`relative px-4 py-2.5 rounded-2xl text-sm max-w-[80%] whitespace-pre-wrap leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-background text-foreground border border-border rounded-tl-none"
                  }`}
                >
                  {renderMessageText(m.text)}
                </div>
              </div>
            ))}

            {/* 로딩 인디케이터 */}
            {isLoading && (
              <div className="flex gap-3 justify-start animate-in fade-in duration-300">
                <Avatar className="w-8 h-8 border bg-background mt-1">
                  <AvatarFallback><Bot className="w-5 h-5 text-primary" /></AvatarFallback>
                </Avatar>
                <div className="bg-background px-4 py-3 rounded-2xl rounded-tl-none border border-border shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>

          {/* 추천 질문 (퀵 버튼) */}
          {!isLoading && (
            <div className="px-4 py-2 bg-background border-t border-border overflow-x-auto whitespace-nowrap scrollbar-hide">
              <div className="flex gap-2">
                {currentQuestions.map((q, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors py-1.5 px-3 font-normal text-xs border border-border bg-background text-muted-foreground shrink-0"
                    onClick={() => handleSend(q)}
                  >
                    <Sparkles className="w-3 h-3 mr-1 text-yellow-500 inline" />
                    {q}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 입력창 */}
          <div className="p-3 bg-background border-t border-border">
            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="궁금한 내용을 입력하세요..."
                className="text-sm flex-1 border-0 focus-visible:ring-0 bg-transparent h-9 px-1"
                onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleSend()}
              />
              <Button 
                size="icon" 
                className={`w-8 h-8 rounded-full shrink-0 transition-all ${
                  input.trim() ? "bg-primary hover:bg-primary/90" : "bg-muted-foreground/30 hover:bg-muted-foreground/30"
                }`}
                disabled={!input.trim() || isLoading}
                onClick={() => handleSend()}
              >
                <Send className="w-4 h-4 text-primary-foreground" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
