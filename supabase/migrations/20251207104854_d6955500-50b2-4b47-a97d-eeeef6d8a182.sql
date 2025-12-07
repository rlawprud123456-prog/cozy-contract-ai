-- 1. 증빙 패키지 테이블
create table if not exists public.evidence_packages (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null,
  project_name text not null,
  contractor_name text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. 증빙 항목 테이블
create table if not exists public.evidence_items (
  id uuid not null default gen_random_uuid() primary key,
  package_id uuid not null references public.evidence_packages(id) on delete cascade,
  type text not null,
  title text not null,
  file_url text not null,
  status text not null default 'verified',
  verified_at timestamptz default now(),
  created_at timestamptz not null default now()
);

-- 3. AI 인테리어 생성 기록 테이블
create table if not exists public.ai_generations (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null,
  original_image_url text not null,
  generated_image_url text,
  style text not null,
  prompt text,
  status text not null default 'processing',
  created_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.evidence_packages enable row level security;
alter table public.evidence_items enable row level security;
alter table public.ai_generations enable row level security;

-- RLS 정책
create policy "Users can manage own evidence packages" on public.evidence_packages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own evidence items" on public.evidence_items for all using (exists (select 1 from public.evidence_packages p where p.id = package_id and p.user_id = auth.uid())) with check (exists (select 1 from public.evidence_packages p where p.id = package_id and p.user_id = auth.uid()));

create policy "Users can manage own ai generations" on public.ai_generations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 관리자 정책
create policy "Admins can view all evidence packages" on public.evidence_packages for select using (has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can view all evidence items" on public.evidence_items for select using (has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can view all ai generations" on public.ai_generations for select using (has_role(auth.uid(), 'admin'::app_role));