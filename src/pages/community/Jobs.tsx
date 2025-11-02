import { useState } from "react";
import CommunityPostForm from "@/components/CommunityPostForm";
import CommunityPostList from "@/components/CommunityPostList";

export default function Jobs() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <h1 className="text-3xl font-bold text-primary mb-2">구인구직</h1>
        <p className="text-muted-foreground mb-8">인테리어 분야의 구인·구직 정보를 확인하세요</p>
        
        <div className="space-y-8">
          <CommunityPostForm 
            category="jobs" 
            onSuccess={() => setRefresh(prev => prev + 1)} 
          />
          
          <CommunityPostList category="jobs" refresh={refresh} />
        </div>
      </div>
    </div>
  );
}
