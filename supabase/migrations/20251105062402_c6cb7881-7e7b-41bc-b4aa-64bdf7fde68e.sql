-- ============================================
-- 1. profiles 테이블 수정 (이미 존재)
-- ============================================
alter table public.profiles 
  add column if not exists avatar_url text;

-- ============================================
-- 2. partners 테이블에 user_id 컬럼 추가
-- ============================================
alter table public.partners 
  add column if not exists user_id uuid references public.profiles(id) on delete set null;

-- ============================================
-- 3. community_posts 테이블에 partner_id 컬럼 추가
-- ============================================
alter table public.community_posts
  add column if not exists partner_id uuid references public.partners(id) on delete set null;

-- ============================================
-- 4. post_likes 테이블 (좋아요)
-- ============================================
create table if not exists public.post_likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

alter table public.post_likes enable row level security;

drop policy if exists "Likes are viewable by everyone" on public.post_likes;
drop policy if exists "Users can like posts" on public.post_likes;
drop policy if exists "Users can unlike posts" on public.post_likes;

create policy "Likes are viewable by everyone" 
  on public.post_likes for select using (true);
  
create policy "Users can like posts" 
  on public.post_likes for insert with check (auth.uid() = user_id);
  
create policy "Users can unlike posts" 
  on public.post_likes for delete using (auth.uid() = user_id);

-- ============================================
-- 5. RPC 함수들
-- ============================================

-- 좋아요 토글
create or replace function public.toggle_post_like(p_post_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_exists boolean;
  v_new_count int;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- 이미 좋아요 했는지 확인
  select exists(
    select 1 from public.post_likes 
    where post_id = p_post_id and user_id = v_user_id
  ) into v_exists;

  if v_exists then
    -- 좋아요 취소
    delete from public.post_likes 
    where post_id = p_post_id and user_id = v_user_id;
    
    update public.community_posts 
    set like_count = greatest(coalesce(like_count, 0) - 1, 0)
    where id = p_post_id;
  else
    -- 좋아요 추가
    insert into public.post_likes (post_id, user_id) 
    values (p_post_id, v_user_id);
    
    update public.community_posts 
    set like_count = coalesce(like_count, 0) + 1
    where id = p_post_id;
  end if;

  -- 최신 like_count 반환
  select coalesce(like_count, 0) into v_new_count
  from public.community_posts
  where id = p_post_id;

  return json_build_object('liked', not v_exists, 'count', v_new_count);
end;
$$;

-- 사용자의 좋아요 여부 확인
create or replace function public.check_post_liked(p_post_id uuid)
returns boolean
language sql
security invoker
stable
set search_path = public
as $$
  select exists(
    select 1 from public.post_likes 
    where post_id = p_post_id and user_id = auth.uid()
  );
$$;

-- ============================================
-- 6. 인덱스 (성능 최적화)
-- ============================================
create index if not exists idx_posts_user_id on public.community_posts(user_id);
create index if not exists idx_posts_category on public.community_posts(category);
create index if not exists idx_posts_created_at on public.community_posts(created_at desc);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_comments_user_id on public.comments(user_id);
create index if not exists idx_likes_post_id on public.post_likes(post_id);
create index if not exists idx_likes_user_id on public.post_likes(user_id);

-- ============================================
-- 7. Storage 버킷 (이미지 업로드용)
-- ============================================
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Storage 정책
drop policy if exists "Anyone can view post images" on storage.objects;
drop policy if exists "Authenticated users can upload post images" on storage.objects;
drop policy if exists "Users can update own images" on storage.objects;
drop policy if exists "Users can delete own images" on storage.objects;

create policy "Anyone can view post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Authenticated users can upload post images"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images' 
    and auth.role() = 'authenticated'
  );

create policy "Users can update own images"
  on storage.objects for update
  using (
    bucket_id = 'post-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own images"
  on storage.objects for delete
  using (
    bucket_id = 'post-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );