import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import PostForm from "@/components/community/PostForm";
import PostList from "@/components/community/PostList";

export default function DiyTips() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">셀프인테리어 팁</h1>
            <p className="text-muted-foreground">직접 해보는 인테리어 노하우를 공유하세요</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <PenSquare className="w-4 h-4 mr-2" />
            {showForm ? "취소" : "글쓰기"}
          </Button>
        </div>
        
        {showForm && (
          <div className="mb-8">
            <PostForm
              category="diy-tips"
              onSuccess={() => {
                setShowForm(false);
                window.location.reload();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <PostList category="diy-tips" />
      </div>
    </div>
  );
}
