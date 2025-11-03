-- 피해신고 테이블 생성
CREATE TABLE public.damage_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  phone TEXT,
  business_license TEXT,
  amount BIGINT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 피해신고를 조회 가능
CREATE POLICY "Anyone can view damage reports"
ON public.damage_reports
FOR SELECT
USING (true);

-- RLS 정책: 인증된 사용자만 피해신고 작성 가능
CREATE POLICY "Authenticated users can create damage reports"
ON public.damage_reports
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 본인의 피해신고만 수정 가능
CREATE POLICY "Users can update their own damage reports"
ON public.damage_reports
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS 정책: 본인의 피해신고만 삭제 가능
CREATE POLICY "Users can delete their own damage reports"
ON public.damage_reports
FOR DELETE
USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_damage_reports_updated_at
  BEFORE UPDATE ON public.damage_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();