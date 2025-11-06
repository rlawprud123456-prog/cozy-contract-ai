import EstimateRequestForm from "@/components/estimate/EstimateRequestForm";

export default function EstimatePage() {
  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <EstimateRequestForm />
      </div>
    </div>
  );
}
