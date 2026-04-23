-- Replace boolean is_remote with a three-state work_mode column.

alter table public.jobs
  add column if not exists work_mode text not null default 'onsite'
    check (work_mode in ('remote', 'onsite', 'hybrid'));

update public.jobs
set work_mode = case when is_remote then 'remote' else 'onsite' end;

alter table public.jobs drop column if exists is_remote;
