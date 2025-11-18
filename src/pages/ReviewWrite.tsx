import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const reviewSchema = z.object({
  partner_id: z.string().uuid("파트너를 선택해주세요"),
  title: z.string().min(5, "제목은 최소 5자 이상이어야 합니다").max(100, "제목은 최대 100자까지 입력 가능합니다"),
  content: z.string().min(10, "내용은 최소 10자 이상이어야 합니다").max(1000, "내용은 최대 1000자까지 입력 가능합니다"),
  rating: z.number().min(1).max(5),
});

type Partner = {
  id: string;
  business_name: string;
  category: string;
};

export default function ReviewWrite() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerId, setPartnerId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchPartners();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "리뷰를 작성하려면 로그인해주세요.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    setUser(user);
  };

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("id, business_name, category")
        .eq("status", "approved")
        .order("business_name");

      if (error) throw error;
      setPartners(data || []);
    } catch (error: any) {
      toast({
        title: "파트너 목록을 불러올 수 없습니다",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      const validatedData = reviewSchema.parse({
        partner_id: partnerId,
        title: title.trim(),
        content: content.trim(),
        rating,
      });

      setLoading(true);

      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        partner_id: validatedData.partner_id,
        title: validatedData.title,
        content: validatedData.content,
        rating: validatedData.rating,
      });

      if (error) throw error;

      toast({
        title: "리뷰가 등록되었습니다",
        description: "소중한 의견 감사합니다.",
      });

      navigate("/reviews");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "입력 오류",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "리뷰 등록 실패",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-2xl">
        <Card>
          <CardHeader className="p-4 sm:p-5 md:p-6">
            <CardTitle className="text-xl sm:text-2xl">리뷰 작성하기</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              파트너와의 경험을 공유해주세요
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="partner">파트너 선택 *</Label>
                <Select value={partnerId} onValueChange={setPartnerId}>
                  <SelectTrigger id="partner">
                    <SelectValue placeholder="파트너를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.business_name} ({partner.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>별점 *</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground self-center">
                      {rating}점
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="리뷰 제목을 입력하세요 (5-100자)"
                  maxLength={100}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/100
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">내용 *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="상세한 리뷰를 작성해주세요 (10-1000자)"
                  rows={8}
                  maxLength={1000}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {content.length}/1000
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/reviews")}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "등록 중..." : "리뷰 등록"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
