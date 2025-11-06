-- 견적 신청 테이블 생성
CREATE TABLE public.estimate_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  area NUMERIC NOT NULL,
  estimated_budget BIGINT,
  description TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.estimate_requests ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 견적 신청을 볼 수 있음
CREATE POLICY "Users can view their own estimate requests"
ON public.estimate_requests
FOR SELECT
USING (auth.uid() = user_id);

-- RLS 정책: 사용자는 견적 신청을 생성할 수 있음
CREATE POLICY "Users can create estimate requests"
ON public.estimate_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 견적 신청을 수정할 수 있음
CREATE POLICY "Users can update their own estimate requests"
ON public.estimate_requests
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS 정책: 관리자는 모든 견적 신청을 볼 수 있음
CREATE POLICY "Admins can view all estimate requests"
ON public.estimate_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS 정책: 관리자는 모든 견적 신청을 관리할 수 있음
CREATE POLICY "Admins can manage all estimate requests"
ON public.estimate_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_estimate_requests_updated_at
BEFORE UPDATE ON public.estimate_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();