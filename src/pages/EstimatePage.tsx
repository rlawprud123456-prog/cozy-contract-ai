import EstimateBuilder from "@/components/estimate/EstimateBuilder";

export default function EstimatePage() {
  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <EstimateBuilder 
          onMakeSummary={(text, total) => {
            console.log("견적 완성:", text, total);
          }} 
        />
      </div>
    </div>
  );
}
