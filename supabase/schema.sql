-- One Tap — the whole database.
-- Run this once in the Supabase SQL editor.

create table if not exists public.jobs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  customer   text not null check (length(btrim(customer)) > 0),
  job        text not null check (length(btrim(job)) > 0),
  price      numeric(10, 2) not null default 0 check (price >= 0),
  cost       numeric(10, 2) not null default 0 check (cost >= 0),
  created_at timestamptz not null default now()
);

create index if not exists jobs_user_created_idx
  on public.jobs (user_id, created_at desc);

alter table public.jobs enable row level security;

-- One policy. A tradie sees his own jobs and nobody else's.
drop policy if exists "own rows" on public.jobs;
create policy "own rows" on public.jobs
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
