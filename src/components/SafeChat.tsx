import { useState } from "react";
import { Send, Lock, AlertTriangle, Shield, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SafeChat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "system", text: "안심 채팅방이 개설되었습니다. 모든 대화 내용은 서버에 저장되어 분쟁 시 법적 효력을 갖습니다." },
    { id: 2, sender: "partner", text: "안녕하세요 고객님! 요청하신 타일 자재 확인했습니다." },
    { id: 3, sender: "me", text: "네, 그레이 톤으로 진행 부탁드려요." },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input) return;
    setMessages([...messages, { id: Date.now(), sender: "me", text: input }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      
      {/* --- Feature 3: 강력한 경고 헤더 --- */}
      <div className="bg-slate-900 text-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-green-400" />
          <h1 className="font-bold">안심 보호 채팅</h1>
        </div>
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm">
              잠깐! 카카오톡, 전화 등 앱 외부에서 대화하거나 직거래를 유도할 경우, 
              <span className="text-red-300 font-bold"> 먹튀/하자 피해 발생 시 보호받을 수 없습니다.</span>
              <br />반드시 이 채팅방을 이용해 주세요.
            </p>
          </div>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((msg) => (
          msg.sender === "system" ? (
            <div key={msg.id} className="flex justify-center">
              <span className="text-xs text-muted-foreground bg-slate-200 px-3 py-1.5 rounded-full">
                {msg.text}
              </span>
            </div>
          ) : (
            <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                msg.sender === "me" 
                  ? "bg-blue-600 text-white rounded-br-sm" 
                  : "bg-white text-foreground shadow-sm rounded-bl-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          )
        ))}
      </div>

      {/* 입력창 */}
      <div className="p-3 bg-white border-t">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="rounded-full bg-slate-100 border-0"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button size="icon" className="shrink-0 rounded-full" onClick={sendMessage}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
