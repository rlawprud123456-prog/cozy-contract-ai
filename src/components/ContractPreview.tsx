import { X, FileText, Calendar, MapPin, User, Phone, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContractPreviewProps {
  contract: {
    projectName: string;
    partnerName: string;
    partnerPhone: string;
    userName: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    totalAmount: number;
    depositAmount: number;
    midAmount: number;
    finalAmount: number;
  };
  onClose: () => void;
}

export default function ContractPreview({ contract, onClose }: ContractPreviewProps) {
  const formatMoney = (amount: number) => amount.toLocaleString("ko-KR");
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-background rounded-lg shadow-2xl max-w-3xl w-full my-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold">계약서 미리보기</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 계약서 내용 */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* 계약 제목 */}
          <div className="text-center pb-4 border-b-2">
            <h1 className="text-3xl font-bold mb-2">인테리어 시공 계약서</h1>
            <p className="text-sm text-muted-foreground">에스크로 결제 보호</p>
          </div>

          {/* 프로젝트 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                프로젝트 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="font-semibold">프로젝트명:</div>
                <div>{contract.projectName}</div>
                
                <div className="font-semibold flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  시공 장소:
                </div>
                <div>{contract.location}</div>
                
                <div className="font-semibold flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  시공 기간:
                </div>
                <div>
                  {formatDate(contract.startDate)} ~ {formatDate(contract.endDate)}
                </div>
              </div>

              {contract.description && (
                <div className="pt-2 border-t">
                  <div className="font-semibold text-sm mb-1">프로젝트 설명:</div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {contract.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 당사자 정보 */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* 발주자 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  발주자 (갑)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <span className="font-semibold">이름:</span> {contract.userName}
                </div>
              </CardContent>
            </Card>

            {/* 시공자 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  시공자 (을)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <span className="font-semibold">이름:</span> {contract.partnerName}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span className="font-semibold">연락처:</span> {contract.partnerPhone}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 계약 금액 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                계약 금액 및 지불 조건
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-accent/10 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold">총 계약 금액</span>
                  <span className="text-2xl font-bold text-accent">
                    {formatMoney(contract.totalAmount)}원
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-3 bg-secondary/30 rounded">
                  <span className="font-semibold">선금 (계약시)</span>
                  <span className="font-semibold">{formatMoney(contract.depositAmount)}원</span>
                </div>
                <div className="flex justify-between p-3 bg-secondary/30 rounded">
                  <span className="font-semibold">중도금 (시공 중)</span>
                  <span className="font-semibold">{formatMoney(contract.midAmount)}원</span>
                </div>
                <div className="flex justify-between p-3 bg-secondary/30 rounded">
                  <span className="font-semibold">잔금 (완료시)</span>
                  <span className="font-semibold">{formatMoney(contract.finalAmount)}원</span>
                </div>
              </div>

              <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg text-xs text-muted-foreground">
                ※ 본 계약은 에스크로 결제로 보호되며, 각 단계별 작업 완료 확인 후 단계별 금액이 시공자에게 지급됩니다.
              </div>
            </CardContent>
          </Card>

          {/* 특약 사항 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">특약 사항</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-muted-foreground">
              <p>1. 본 계약은 에스크로 결제 시스템을 통해 진행되며, 발주자가 예치한 금액은 각 단계별 작업 완료 확인 후 시공자에게 지급됩니다.</p>
              <p>2. 시공자는 계약서에 명시된 시공 기간 내에 작업을 완료해야 하며, 불가피한 사유로 지연이 발생할 경우 발주자와 협의하여야 합니다.</p>
              <p>3. 공사 중 설계 변경이나 추가 공사가 필요한 경우, 양 당사자의 합의 하에 별도 계약을 체결합니다.</p>
              <p>4. 본 계약서는 전자 문서로 작성되었으며, 양 당사자의 동의로 법적 효력을 가집니다.</p>
            </CardContent>
          </Card>

          {/* 서명 영역 */}
          <div className="grid md:grid-cols-2 gap-6 pt-4">
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold">발주자 (갑)</p>
              <p className="text-lg">{contract.userName}</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold">시공자 (을)</p>
              <p className="text-lg">{contract.partnerName}</p>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            작성일: {new Date().toLocaleDateString("ko-KR")}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t">
          <Button onClick={onClose} className="w-full bg-accent hover:bg-accent/90">
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
