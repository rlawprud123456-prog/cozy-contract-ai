export default function Sad() {
  return (
    <div className="min-h-[calc(100vh-180px)] bg-background p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <h1 className="text-3xl font-bold text-primary mb-2">속상해요</h1>
        <p className="text-muted-foreground mb-8">인테리어 과정에서 겪은 어려움을 공유하고 위로받으세요</p>
        
        <div className="bg-card rounded-lg p-8 text-center">
          <p className="text-muted-foreground">게시글이 준비 중입니다</p>
        </div>
      </div>
    </div>
  );
}
