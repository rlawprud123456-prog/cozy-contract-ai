import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { contracts } from "@/services/api";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function History() {
  const [items, setItems] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { items } = await contracts.history();
    setItems(items);
  };

  const handleDelete = async (id: number) => {
    await contracts.remove(id);
    toast({ title: "삭제 완료", description: "검토 이력이 삭제되었습니다" });
    loadHistory();
  };

  const getRiskColor = (risk: string) => {
    if (risk === "높음") return "destructive";
    if (risk === "보통") return "default";
    return "secondary";
  };

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-3 sm:p-4">
      <div className="container mx-auto max-w-4xl py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">계약 검토 이력</h1>
        
        {items.length === 0 ? (
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="py-12 text-center text-muted-foreground">
              아직 검토한 계약서가 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="shadow-[var(--shadow-card)]">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        계약서 검토
                        <Badge variant={getRiskColor(item.risk)}>{item.risk}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {new Date(item.id).toLocaleString('ko-KR')}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {item.text.substring(0, 200)}...
                    </p>
                    {item.suggestions && (
                      <div className="mt-4 p-4 bg-secondary/50 rounded-md">
                        <h4 className="font-semibold mb-2">개선 제안</h4>
                        <p className="text-sm">{item.suggestions}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
