-- partners 테이블에 location 컬럼 추가
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS location text;

-- 인덱스 추가 (지역 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_partners_location ON public.partners(location);
