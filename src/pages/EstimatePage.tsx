import EstimateRequestForm from "@/components/estimate/EstimateRequestForm";
import { AppPage } from "@/components/layout/AppPage";
import { Calculator } from "lucide-react";

export default function EstimatePage() {
  return (
    <AppPage
      title="AI 자동 견적"
      description="프로젝트 정보를 입력하면 AI가 자동으로 견적서를 생성해드립니다"
      icon={<Calculator className="w-6 h-6 text-accent" />}
      maxWidth="lg"
    >
      <EstimateRequestForm />
    </AppPage>
  );
}
