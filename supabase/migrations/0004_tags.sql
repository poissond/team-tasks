-- ============================================================
-- 0004_tags.sql
-- tags + task_tags 테이블 생성 + RLS 정책
-- ============================================================

create table tags (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  color      text        not null default '#6366f1',
  created_by uuid        not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint tags_name_created_by_unique unique (name, created_by)
);

-- 태그 ↔ 일감 다대다 연결
create table task_tags (
  task_id uuid not null references tasks(id) on delete cascade,
  tag_id  uuid not null references tags(id)  on delete cascade,
  primary key (task_id, tag_id)
);

alter table tags      enable row level security;
alter table task_tags enable row level security;

-- 로그인한 사용자는 모든 태그 조회 가능
create policy "tags_select" on tags
  for select using (auth.uid() is not null);

-- 본인 created_by로만 삽입 가능
create policy "tags_insert" on tags
  for insert with check (auth.uid() = created_by);

-- 작성자만 수정
create policy "tags_update" on tags
  for update
  using  (auth.uid() = created_by)
  with check (auth.uid() = created_by);

-- 작성자만 삭제
create policy "tags_delete" on tags
  for delete using (auth.uid() = created_by);

-- task_tags: 로그인 사용자 전체 읽기·쓰기
create policy "task_tags_select" on task_tags
  for select using (auth.uid() is not null);

create policy "task_tags_insert" on task_tags
  for insert with check (auth.uid() is not null);

create policy "task_tags_delete" on task_tags
  for delete using (auth.uid() is not null);
