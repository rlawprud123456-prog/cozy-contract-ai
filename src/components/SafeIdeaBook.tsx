import { useState } from "react";
import { Check, BookOpen, AlertCircle, FileCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const ideas = [
  { id: 1, title: "거실 아트월 레퍼런스", img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&q=80", note: "이 느낌의 1200*600 포세린 타일로 시공" },
  { id: 2, title: "주방 상부장 없는 스타일", img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80", note: "상부장 제거하고 침니후드 설치" },
];

export default function SafeIdeaBook() {
  const { toast } = useToast();
  const [selected, setSelected] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    if (selected.includes(id)) setSelected(selected.filter(i => i !== id));
    else setSelected([...selected, id]);
  };

  const handleContract = () => {
    toast({
      title: "계약서 별첨 완료",
      description: `선택한 ${selected.length}장의 사진이 시공 기준 자료로 계약서에 포함되었습니다.`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-6 h-6" />
          <h1 className="text-xl font-bold"> 안심 아이디어 북</h1>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-4">
          <AlertCircle className="w-5 h-5 mb-2" />
          <p className="text-sm font-medium leading-relaxed">
            말로만 "예쁘게 해주세요"라고 하면 분쟁이 생깁니다.
            <br />
            원하는 사진을 선택하고 '계약서 첨부'를 누르세요.
            <br />
            이 사진이 나중에 하자를 판단하는 법적 기준이 됩니다.
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {ideas.map((item) => (
          <Card
            key={item.id}
            onClick={() => toggleSelect(item.id)}
            className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${
              selected.includes(item.id) ? "border-blue-600 ring-4 ring-blue-100" : "border-transparent"
            }`}
          >
            <img src={item.img} alt={item.title} className="w-full aspect-video object-cover" />
            
            {/* 오버레이 정보 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
              <p className="text-white font-bold text-lg">{item.title}</p>
              <p className="text-white/80 text-sm mt-1">📌 요구사항: {item.note}</p>
            </div>

            {/* 선택 체크박스 UI */}
            <div className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              selected.includes(item.id) ? 'bg-blue-600' : 'bg-white/50 border-2 border-white'
            }`}>
              <Check className={`w-4 h-4 ${selected.includes(item.id) ? 'text-white' : 'text-transparent'}`} />
            </div>

            {/* 계약서 첨부 도장 효과 */}
            {selected.includes(item.id) && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-12deg]">
                <Badge className="bg-red-600/90 text-white text-sm px-4 py-2 rounded-md border-2 border-red-400 shadow-lg">
                  계약 기준 자료 포함됨
                </Badge>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button 
          className="w-full h-14 text-base font-bold" 
          onClick={handleContract}
          disabled={selected.length === 0}
        >
          <FileCheck className="w-5 h-5 mr-2" />
          선택한 {selected.length}장 계약서에 박제하기
        </Button>
      </div>
    </div>
  );
}
