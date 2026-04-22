-- Jobs: every opportunity tracked inside a board.

create type public.job_status as enum (
  'watchlist',
  'applied',
  'interview',
  'offer'
);

create type public.application_outcome as enum (
  'pending',
  'accepted',
  'rejected'
);

create table if not exists public.jobs (
  id                  uuid        primary key default gen_random_uuid(),
  board_id            uuid        not null references public.boards (id) on delete cascade,
  company_name        text        not null,
  company_url         text,
  contact_email       text,
  contact_phone       text,
  job_title           text        not null,
  location            text,
  status              public.job_status           not null default 'watchlist',
  application_outcome public.application_outcome  not null default 'pending',
  notes               text,
  salary_range        text,
  next_action_date    date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists jobs_board_id_idx         on public.jobs (board_id);
create index if not exists jobs_board_id_status_idx  on public.jobs (board_id, status);

-- Keep updated_at in sync on every row change.
create or replace function public.jobs_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row
  execute function public.jobs_set_updated_at();

-- When the user marks a card as accepted, the board auto-promotes it to the Interview column.
create or replace function public.jobs_promote_on_accepted()
returns trigger
language plpgsql
as $$
begin
  if new.application_outcome = 'accepted' and new.status <> 'interview' then
    new.status := 'interview';
  end if;
  return new;
end;
$$;

create trigger jobs_promote_on_accepted
  before insert or update of application_outcome on public.jobs
  for each row
  execute function public.jobs_promote_on_accepted();

alter table public.jobs enable row level security;

comment on table public.jobs is
  'Individual job opportunity inside a board. Access is scoped by board_id; the server must validate the UUID before returning rows.';
