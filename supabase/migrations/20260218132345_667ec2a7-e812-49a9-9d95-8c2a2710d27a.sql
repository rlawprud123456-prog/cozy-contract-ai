-- 1. 에스크로 상태 및 거절 사유 컬럼 추가
ALTER TABLE public.contract_stages 
ADD COLUMN IF NOT EXISTS escrow_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS reject_reason text;

-- 2. 기존 삭제 정책 충돌 방지
DROP POLICY IF EXISTS "Admins can delete contract stages" ON public.contract_stages;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.contract_stages;

-- 3. 삭제 권한 전면 허용 정책
CREATE POLICY "Enable delete for all users"
ON public.contract_stages
FOR DELETE
USING (true);