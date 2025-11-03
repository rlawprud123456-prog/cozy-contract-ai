import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "bot", text: "안녕하세요 👋 새로고침 AI 계약 도우미입니다.\n궁금한 계약 내용을 물어보세요." }
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const newMsg = { role: "user", text: input };
    setMessages((m) => [...m, newMsg]);
    setInput("");

    // 더미 응답 로직 (AI 시뮬레이션)
    setTimeout(() => {
      const lower = input.toLowerCase();
      let reply =
        "계약 관련 도움을 드릴게요. 예: '선금 비율', '위약금 조항', '하자보수 기간' 등으로 물어보세요.";
      if (lower.includes("선금")) reply = "선금은 총 금액의 10~30% 수준이 적정합니다. 너무 높으면 위험해요.";
      else if (lower.includes("중도금"))
        reply = "중도금은 진행률에 맞춰 2~3회 분할 지급하는 것이 안전합니다.";
      else if (lower.includes("위약") || lower.includes("벌금"))
        reply = "위약금은 상호 대칭적으로 설정되어야 합니다. 일방적이면 불공정 조항이에요.";
      else if (lower.includes("하자") || lower.includes("a/s"))
        reply = "하자보수 책임 기간은 1년 이상 명시하는 것이 권장됩니다.";
      else if (lower.includes("계약") || lower.includes("검토"))
        reply = "계약서의 주요 조항(금액, 일정, 하자, 책임)을 꼭 AI 검토 기능으로 확인하세요.";
      setMessages((m) => [...m, { role: "bot", text: reply }]);
    }, 800);
  };

  return (
    <div>
      {/* 플로팅 버튼 */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:scale-105 transition z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* 챗봇 창 */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 bg-background border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden z-50">
          <div className="flex items-center justify-between bg-primary text-primary-foreground px-4 py-2">
            <span className="font-semibold text-sm">AI 계약 도우미 (베타)</span>
            <button onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto text-sm space-y-2 max-h-96">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-accent/30 text-right text-foreground ml-auto max-w-[80%]"
                    : "bg-muted/50 text-left mr-auto max-w-[80%]"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="flex items-center border-t border-border px-2 py-1 bg-muted/30">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="질문을 입력하세요"
              className="text-sm flex-1 border-0 focus-visible:ring-0 bg-transparent"
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <Button size="icon" variant="ghost" onClick={send}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
