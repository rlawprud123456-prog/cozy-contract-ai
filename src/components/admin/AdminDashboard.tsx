import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, FileText, Calculator, DollarSign, Shield } from "lucide-react";

interface AdminDashboardProps {
  stats: {
    users: number;
    partners: number;
    contracts: number;
    estimates: number;
    pendingPayments: number;
    damageReports: number;
  };
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const cards = [
    { title: "총 사용자", value: stats.users, icon: Users, color: "text-blue-600" },
    { title: "등록 파트너", value: stats.partners, icon: Briefcase, color: "text-green-600" },
    { title: "계약 건수", value: stats.contracts, icon: FileText, color: "text-purple-600" },
    { title: "견적 요청", value: stats.estimates, icon: Calculator, color: "text-orange-600" },
    { title: "대기중 결제", value: stats.pendingPayments, icon: DollarSign, color: "text-yellow-600" },
    { title: "피해 신고", value: stats.damageReports, icon: Shield, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <p className="text-muted-foreground mt-2">시스템 전체 현황을 확인하세요</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
