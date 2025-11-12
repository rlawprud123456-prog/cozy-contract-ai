-- 1. escrow_payments 상태에 pending_approval 추가
ALTER TABLE public.escrow_payments 
DROP CONSTRAINT IF EXISTS escrow_payments_status_check;

ALTER TABLE public.escrow_payments 
ADD CONSTRAINT escrow_payments_status_check 
CHECK (status IN ('held', 'pending_approval', 'released', 'refunded'));

-- 2. escrow_payments RLS 정책 업데이트
DROP POLICY IF EXISTS escrow_owner_upd ON public.escrow_payments;

-- 사용자는 held -> pending_approval만 가능
CREATE POLICY "escrow_user_request_approval" 
ON public.escrow_payments 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.contracts c 
    WHERE c.id = escrow_payments.contract_id 
    AND c.user_id = auth.uid()
  )
  AND status = 'held'
)
WITH CHECK (
  status = 'pending_approval'
);

-- 관리자는 pending_approval -> released 또는 held로 변경 가능
CREATE POLICY "escrow_admin_approve" 
ON public.escrow_payments 
FOR UPDATE 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND status = 'pending_approval'
)
WITH CHECK (
  status IN ('released', 'held', 'refunded')
);

-- 3. 관리자가 모든 escrow_payments 조회 가능하도록 정책 추가
CREATE POLICY "escrow_admin_select" 
ON public.escrow_payments 
FOR SELECT 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);