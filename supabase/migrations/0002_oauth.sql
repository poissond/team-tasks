-- ============================================================
-- 0002_oauth.sql
-- Google OAuth 도입에 맞춘 tasks 테이블 스키마·RLS 정비
-- ============================================================

-- 1. assignee_id FK: set null 유지 (재선언)
alter table tasks
  drop constraint if exists tasks_assignee_id_fkey,
  add constraint tasks_assignee_id_fkey
    foreign key (assignee_id) references auth.users(id) on delete set null;

-- 2. created_by FK: set null → cascade 로 변경
alter table tasks
  drop constraint if exists tasks_created_by_fkey,
  add constraint tasks_created_by_fkey
    foreign key (created_by) references auth.users(id) on delete cascade;

-- 3. 인증 도입 이전에 삽입된 row 정리
delete from tasks where created_by is null;

-- 4. created_by not null 강화
alter table tasks alter column created_by set not null;

-- 5. 임시 정책 제거
drop policy if exists "temp_all_access" on tasks;

-- 6. 정식 RLS 정책 4종
create policy "tasks_select" on tasks
  for select using (
    auth.uid() = created_by
    or auth.uid() = assignee_id
  );

create policy "tasks_insert" on tasks
  for insert with check (
    auth.uid() = created_by
  );

create policy "tasks_update" on tasks
  for update
  using (auth.uid() = created_by or auth.uid() = assignee_id)
  with check (auth.uid() = created_by or auth.uid() = assignee_id);

create policy "tasks_delete" on tasks
  for delete using (
    auth.uid() = created_by
  );
