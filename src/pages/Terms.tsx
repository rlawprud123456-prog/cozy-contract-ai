import { AppPage } from "@/components/layout/AppPage";
import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  return (
    <AppPage title="이용약관" description="바로고침 서비스 이용약관">
      <Card>
        <CardContent className="prose prose-sm max-w-none p-6 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground">제1조 (목적)</h2>
            <p className="text-muted-foreground leading-relaxed">
              본 약관은 바로고침(이하 "회사")이 제공하는 인테리어 중개 및 안전 결제 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">제2조 (용어의 정의)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>"서비스"란 회사가 웹사이트를 통해 제공하는 인테리어 업체 매칭, 계약 관리, 에스크로 결제 등의 제반 서비스를 의미합니다.</li>
              <li>"회원"이란 본 약관에 동의하고 회사에 개인정보를 제공하여 회원등록을 한 자를 말합니다.</li>
              <li>"파트너"란 회사 승인을 받아 시공 서비스를 제공하는 인테리어 업체를 의미합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">제3조 (서비스의 제공)</h2>
            <p className="text-muted-foreground leading-relaxed">
              회사는 다음과 같은 서비스를 제공합니다.
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>인테리어 시공 견적 중개</li>
              <li>표준 계약서 자동 생성 및 AI 분석</li>
              <li>공사 대금 예치(에스크로) 및 지급 관리</li>
              <li>시공 사례 및 파트너 정보 제공</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">제4조 (회원의 의무)</h2>
            <p className="text-muted-foreground leading-relaxed">
              회원은 관계법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항, 회사가 통지하는 사항 등을 준수하여야 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">제5조 (책임 제한)</h2>
            <p className="text-muted-foreground leading-relaxed">
              회사는 파트너와 회원 간의 거래를 중개하는 플랫폼 서비스 제공자로서, 파트너가 제공하는 시공 용역의 품질이나 하자 등에 대하여 직접적인 책임을 지지 않습니다. 단, 회사가 제공하는 에스크로 정책에 따른 대금 보호 의무는 예외로 합니다.
            </p>
          </section>

          <section className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">공고일자: 2026년 1월 23일</p>
            <p className="text-sm text-muted-foreground">시행일자: 2026년 1월 23일</p>
          </section>
        </CardContent>
      </Card>
    </AppPage>
  );
}
