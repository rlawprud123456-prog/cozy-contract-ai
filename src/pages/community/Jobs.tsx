import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import PostForm from "@/components/community/PostForm";
import PostList from "@/components/community/PostList";

export default function Jobs() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">구인구직</h1>
            <p className="text-muted-foreground">인테리어 분야의 구인·구직 정보를 확인하세요</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <PenSquare className="w-4 h-4 mr-2" />
            {showForm ? "취소" : "글쓰기"}
          </Button>
        </div>
        
        {showForm && (
          <div className="mb-8">
            <PostForm
              category="jobs"
              onSuccess={() => {
                setShowForm(false);
                window.location.reload();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <PostList category="jobs" />
      </div>
    </div>
  );
}
