import EstimateBuilder from "@/components/EstimateBuilder";

export default function Estimate() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">견적서 작성</h1>
          <p className="text-muted-foreground">
            인테리어 공사 견적서를 쉽고 빠르게 작성하세요
          </p>
        </div>
        <EstimateBuilder />
      </div>
    </div>
  );
}
