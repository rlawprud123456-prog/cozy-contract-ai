import { useState } from "react";
import CommunityPostForm from "@/components/CommunityPostForm";
import CommunityPostList from "@/components/CommunityPostList";

export default function Help() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <h1 className="text-3xl font-bold text-primary mb-2">고수님 도와주세요</h1>
        <p className="text-muted-foreground mb-8">인테리어 전문가에게 조언을 구하세요</p>
        
        <div className="space-y-8">
          <CommunityPostForm 
            category="help" 
            onSuccess={() => setRefresh(prev => prev + 1)} 
          />
          
          <CommunityPostList category="help" refresh={refresh} />
        </div>
      </div>
    </div>
  );
}
