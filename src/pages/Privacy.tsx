import { AppPage } from "@/components/layout/AppPage";
import { Card, CardContent } from "@/components/ui/card";

export default function Privacy() {
  return (
    <AppPage title="개인정보처리방침" description="바로고침 개인정보 처리방침">
      <Card>
        <CardContent className="prose prose-sm max-w-none p-6 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. 개인정보의 처리 목적</h2>
            <p className="text-muted-foreground leading-relaxed">
              바로고침(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>회원 가입 및 관리</li>
              <li>견적 상담 및 파트너 매칭 서비스 제공</li>
              <li>계약 체결 및 결제(에스크로) 처리</li>
              <li>고충 처리 및 분쟁 조정을 위한 기록 보존</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. 수집하는 개인정보의 항목</h2>
            <p className="text-muted-foreground leading-relaxed">회사는 서비스 제공을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>필수항목: 이름, 휴대전화번호, 이메일, 주소(시공 현장)</li>
              <li>선택항목: 예산, 시공 희망일, 참고용 현장 사진</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="text-muted-foreground leading-relaxed">
              이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
              <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
              <li>소비자의 불만 및 분쟁처리에 관한 기록: 3년</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. 제3자 제공에 관한 사항</h2>
            <p className="text-muted-foreground leading-relaxed">
              회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 견적 상담 및 시공 계약을 위해 회원의 동의 하에 해당 파트너(시공업체)에게 최소한의 정보를 제공할 수 있습니다.
            </p>
          </section>

          <section className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">개인정보보호책임자: 바로고침 보안팀</p>
            <p className="text-sm text-muted-foreground">시행일자: 2026년 1월 23일</p>
          </section>
        </CardContent>
      </Card>
    </AppPage>
  );
}
