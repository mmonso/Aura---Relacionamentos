-- Run this in your Supabase SQL Editor to ensure user_settings table is correctly configured

-- 1. Check if user_settings table exists and has the correct columns
create table if not exists user_settings (
  user_id text primary key,
  system_context text,
  theme text
);

-- 2. Ensure RLS is enabled
alter table user_settings enable row level security;

-- 3. Drop existing policies to avoid conflicts and ensure clean state
drop policy if exists "Public access to settings" on user_settings;
drop policy if exists "Users can view their own settings" on user_settings;
drop policy if exists "Users can insert/update their own settings" on user_settings;

-- 4. Create a permissive policy for public access (since we are using device ID without auth)
-- This allows ANY operation (SELECT, INSERT, UPDATE, DELETE) on the table for any user.
create policy "Public access to settings"
  on user_settings for all
  using (true)
  with check (true);

-- 5. Grant permissions to the anon role (important for public access)
grant all on user_settings to anon;
grant all on user_settings to authenticated;
grant all on user_settings to service_role;
