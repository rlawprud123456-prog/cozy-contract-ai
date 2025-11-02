import { useState } from "react";
import CommunityPostForm from "@/components/CommunityPostForm";
import CommunityPostList from "@/components/CommunityPostList";

export default function DiyTips() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <h1 className="text-3xl font-bold text-primary mb-2">셀프인테리어 팁</h1>
        <p className="text-muted-foreground mb-8">직접 해보는 인테리어 노하우를 공유하세요</p>
        
        <div className="space-y-8">
          <CommunityPostForm 
            category="diy-tips" 
            onSuccess={() => setRefresh(prev => prev + 1)} 
          />
          
          <CommunityPostList category="diy-tips" refresh={refresh} />
        </div>
      </div>
    </div>
  );
}
