-- contracts 테이블 수정 (기존 컬럼 유지하면서 필요한 컬럼 추가)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS partner_name text,
ADD COLUMN IF NOT EXISTS partner_phone text,
ADD COLUMN IF NOT EXISTS project_name text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS total_amount bigint,
ADD COLUMN IF NOT EXISTS deposit_amount bigint DEFAULT 0,
ADD COLUMN IF NOT EXISTS mid_amount bigint DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_amount bigint DEFAULT 0,
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS end_date date,
ADD COLUMN IF NOT EXISTS pdf_url text;

-- 기존 amount 컬럼이 있다면 total_amount로 데이터 복사 (안전하게)
UPDATE public.contracts 
SET total_amount = amount 
WHERE total_amount IS NULL AND amount IS NOT NULL;

-- escrow_payments 테이블 생성 (contract_id를 uuid로 변경)
CREATE TABLE IF NOT EXISTS public.escrow_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  amount bigint NOT NULL CHECK (amount >= 0),
  type text NOT NULL CHECK (type IN ('deposit','mid','final')),
  status text NOT NULL DEFAULT 'held' CHECK (status IN ('held','released','refunded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz,
  refunded_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_escrow_contract ON public.escrow_payments(contract_id);

-- RLS 활성화
ALTER TABLE public.escrow_payments ENABLE ROW LEVEL SECURITY;

-- escrow_payments RLS 정책 (기존 정책 삭제 후 재생성)
DROP POLICY IF EXISTS "escrow_owner_select" ON public.escrow_payments;
DROP POLICY IF EXISTS "escrow_owner_ins" ON public.escrow_payments;
DROP POLICY IF EXISTS "escrow_owner_upd" ON public.escrow_payments;

CREATE POLICY "escrow_owner_select" ON public.escrow_payments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.contracts c 
    WHERE c.id = escrow_payments.contract_id 
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "escrow_owner_ins" ON public.escrow_payments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contracts c 
    WHERE c.id = contract_id 
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "escrow_owner_upd" ON public.escrow_payments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.contracts c 
    WHERE c.id = escrow_payments.contract_id 
    AND c.user_id = auth.uid()
  )
);

-- 계약 상태를 in_progress로 변경하는 함수
CREATE OR REPLACE FUNCTION public.set_contract_status_in_progress(p_contract_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.contracts
  SET status = 'in_progress'
  WHERE id = p_contract_id AND status = 'pending';
$$;

-- 모든 결제가 released되면 계약을 completed로 변경하는 함수
CREATE OR REPLACE FUNCTION public.set_contract_status_completed_if_all_released(p_contract_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.contracts c
  SET status = 'completed'
  WHERE c.id = p_contract_id
    AND NOT EXISTS (
      SELECT 1 FROM public.escrow_payments p
      WHERE p.contract_id = c.id AND p.status <> 'released'
    );
$$;