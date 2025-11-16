import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type Review = {
  id: string;
  title: string;
  content: string;
  rating: number;
  created_at: string;
  user_id: string;
  partner_id: string;
  images: string[];
};

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      toast({
        title: "리뷰를 불러올 수 없습니다",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">고객 리뷰</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              실제 고객들의 솔직한 후기를 확인하세요
            </p>
          </div>
          <Button onClick={() => navigate("/reviews/write")} className="text-sm sm:text-base w-full sm:w-auto">
            리뷰 작성하기
          </Button>
        </div>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                아직 작성된 리뷰가 없습니다
              </p>
              <Button onClick={() => navigate("/reviews/write")} className="text-sm sm:text-base">
                첫 리뷰 작성하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm">익명</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <CardTitle className="text-base sm:text-lg">{review.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {review.content}
                  </p>
                  {review.images && review.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {review.images.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`리뷰 이미지 ${idx + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
