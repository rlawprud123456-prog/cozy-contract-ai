import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, Shield, Paperclip, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function SafeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: existingRoom } = await supabase
      .from("chat_rooms")
      .select("id")
      .eq("customer_id", user.id)
      .limit(1)
      .maybeSingle();
    
    if (existingRoom) {
      setRoomId(existingRoom.id);
      fetchMessages(existingRoom.id);
    } else {
      const { data: newRoom } = await supabase
        .from("chat_rooms")
        .insert({ customer_id: user.id })
        .select()
        .single();
      if (newRoom) {
        setRoomId(newRoom.id);
        fetchMessages(newRoom.id);
      }
    }
  };

  const fetchMessages = async (rid: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", rid)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!input || !roomId || !userId) return;

    await supabase.from("chat_messages").insert({
      room_id: roomId,
      sender_id: userId,
      content: input
    });

    setInput("");
    fetchMessages(roomId);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="bg-slate-900 text-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-green-400" />
          <h1 className="font-bold">안심 보호 채팅</h1>
        </div>
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm">
            잠깐! 앱 외부에서 대화하거나 직거래를 유도할 경우, 
            <span className="text-red-300 font-bold"> 먹튀/하자 피해 발생 시 보호받을 수 없습니다.</span>
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground py-8">대화 내용이 없습니다.</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
              msg.sender_id === userId 
                ? "bg-blue-600 text-white rounded-br-sm" 
                : "bg-white text-foreground shadow-sm rounded-bl-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-white border-t">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon"><Paperclip className="w-5 h-5 text-muted-foreground" /></Button>
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="메시지를 입력하세요..." 
            className="rounded-full bg-gray-50 border-0" 
            onKeyDown={(e) => e.key === "Enter" && sendMessage()} 
          />
          <Button size="icon" className="rounded-full" onClick={sendMessage}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
