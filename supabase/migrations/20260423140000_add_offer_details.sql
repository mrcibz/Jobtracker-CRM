-- Add offer details to jobs table
alter table public.jobs add column if not exists offer_salary text;
alter table public.jobs add column if not exists offer_deadline date;
