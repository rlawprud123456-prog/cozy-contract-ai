-- 파트너 연락처 정보 공개 노출 문제 해결

-- 1. 공개용 파트너 프로필 뷰 생성 (민감 정보 제외)
CREATE OR REPLACE VIEW public.partner_profiles AS
SELECT 
  id,
  business_name,
  category,
  description,
  portfolio_images,
  status,
  created_at
FROM public.partners
WHERE status = 'approved';

-- 2. 뷰에 대한 RLS 활성화는 필요없음 (이미 필터링됨)

-- 3. 기존 partners 테이블의 "Anyone can view approved partners" 정책 삭제
DROP POLICY IF EXISTS "Anyone can view approved partners" ON public.partners;

-- 4. 새로운 정책: 본인과 관리자만 모든 정보 조회 가능
CREATE POLICY "Partners can view own full info"
ON public.partners FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- 5. 코멘트 추가
COMMENT ON VIEW public.partner_profiles IS '승인된 파트너의 공개 프로필 정보만 포함. 연락처 정보는 제외됨.';
COMMENT ON POLICY "Partners can view own full info" ON public.partners IS '파트너 본인과 관리자만 민감 정보 포함한 전체 정보 조회 가능';