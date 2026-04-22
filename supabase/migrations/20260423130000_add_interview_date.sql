-- Add interview_date to jobs table
alter table public.jobs add column if not exists interview_date timestamptz;
