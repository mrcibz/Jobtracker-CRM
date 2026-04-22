-- Boards: each row is an isolated CRM session, accessed by its UUID (Kahoot-style).

create table if not exists public.boards (
  id         uuid        primary key default gen_random_uuid(),
  created_at timestamptz not null    default now()
);

alter table public.boards enable row level security;

comment on table public.boards is
  'A private CRM session. The row id doubles as the access token — share the UUID to share the board.';
