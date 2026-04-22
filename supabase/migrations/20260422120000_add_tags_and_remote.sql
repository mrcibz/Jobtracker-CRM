-- Add tags (skills) and remote flag to jobs table.

alter table public.jobs
  add column if not exists tags text[] not null default '{}',
  add column if not exists is_remote boolean not null default false;
