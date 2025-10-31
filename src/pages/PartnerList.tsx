import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { partners } from "@/services/api";
import { Star, Phone, ArrowLeft } from "lucide-react";

export default function PartnerList() {
  const { category } = useParams();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (category) {
      partners.listByCategory(category).then(({ items }) => setItems(items));
    }
  }, [category]);

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Link to="/partners" className="inline-flex items-center gap-2 text-accent mb-4 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          카테고리 목록으로
        </Link>
        
        <h1 className="text-3xl font-bold text-primary mb-2">{category}</h1>
        <p className="text-muted-foreground mb-8">전문가 {items.length}명</p>

        {items.length === 0 ? (
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="py-12 text-center text-muted-foreground">
              해당 카테고리에 등록된 전문가가 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((partner) => (
              <Card key={partner.id} className="shadow-[var(--shadow-card)]">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{partner.name}</CardTitle>
                      <CardDescription>{partner.city}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-5 w-5 fill-current" />
                      <span className="font-semibold">{partner.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Phone className="h-4 w-4" />
                    <span>{partner.phone}</span>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90">상담 신청</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
