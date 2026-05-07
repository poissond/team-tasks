-- ============================================================
-- 0003_comments.sql
-- comments 테이블 생성 + RLS 정책
-- ============================================================

create table comments (
  id         uuid        primary key default gen_random_uuid(),
  task_id    uuid        references tasks(id) on delete cascade,
  author_id  uuid        not null references auth.users(id) on delete cascade,
  body       text        not null check (char_length(body) > 0),
  created_at timestamptz not null default now()
);

alter table comments enable row level security;

-- 로그인한 사용자는 모든 댓글 조회 가능
create policy "comments_select" on comments
  for select using (auth.uid() is not null);

-- 본인 author_id로만 삽입 가능
create policy "comments_insert" on comments
  for insert with check (auth.uid() = author_id);

-- 작성자만 수정 가능
create policy "comments_update" on comments
  for update
  using  (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- 작성자만 삭제 가능
create policy "comments_delete" on comments
  for delete using (auth.uid() = author_id);
