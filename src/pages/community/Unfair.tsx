import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PostForm from "@/components/community/PostForm";
import PostList from "@/components/community/PostList";

export default function Unfair() {
  const [showForm, setShowForm] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    setRefresh(prev => prev + 1);
  };

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background p-3 sm:p-4">
      <div className="container mx-auto max-w-4xl py-4 sm:py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div className="px-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-1 sm:mb-2">억울해요</h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">인테리어 업체가 허위 피해를 당한 사례를 공유하세요</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            글쓰기
          </Button>
        </div>
        
        {showForm && (
          <div className="mb-4 sm:mb-6">
            <PostForm 
              category="unfair" 
              onSuccess={handleSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <PostList category="unfair" refresh={refresh} />
      </div>
    </div>
  );
}
