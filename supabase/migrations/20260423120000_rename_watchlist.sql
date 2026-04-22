-- Rename 'watchlist' to 'wishlist' in job_status enum
-- 1. Drop the default on the table column first
alter table public.jobs alter column status drop default;

-- 2. Rename the enum value
alter type public.job_status rename value 'watchlist' to 'wishlist';

-- 3. Set the new default
alter table public.jobs alter column status set default 'wishlist';
