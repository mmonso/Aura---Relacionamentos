-- Run this in your Supabase SQL Editor to adapt for "No Auth" mode

-- 1. Create tables if they don't exist
create table if not exists conversations (
  id text primary key,
  user_id text not null,
  title text,
  updated_at bigint
);

create table if not exists messages (
  id text primary key,
  conversation_id text references conversations(id) on delete cascade,
  role text,
  content text,
  timestamp bigint
);

create table if not exists user_settings (
  user_id text primary key,
  system_context text,
  theme text
);

-- 2. Handle schema migration (if tables existed with UUID types)
do $$
begin
  -- Drop foreign key constraint on conversations.user_id if it exists (from auth.users)
  if exists (select 1 from information_schema.table_constraints where constraint_name = 'conversations_user_id_fkey') then
    alter table conversations drop constraint conversations_user_id_fkey;
  end if;

  -- Drop foreign key constraint on user_settings.user_id if it exists
  if exists (select 1 from information_schema.table_constraints where constraint_name = 'user_settings_user_id_fkey') then
    alter table user_settings drop constraint user_settings_user_id_fkey;
  end if;
end $$;

-- Alter columns to ensure they are text (for device ID support)
alter table conversations alter column user_id type text;
alter table user_settings alter column user_id type text;

-- 3. Drop existing policies to avoid conflicts
drop policy if exists "Users can view their own conversations" on conversations;
drop policy if exists "Users can insert their own conversations" on conversations;
drop policy if exists "Users can update their own conversations" on conversations;
drop policy if exists "Users can delete their own conversations" on conversations;
drop policy if exists "Public access to conversations" on conversations;

drop policy if exists "Users can view messages from their conversations" on messages;
drop policy if exists "Users can insert messages into their conversations" on messages;
drop policy if exists "Public access to messages" on messages;

drop policy if exists "Users can view their own settings" on user_settings;
drop policy if exists "Users can insert/update their own settings" on user_settings;
drop policy if exists "Public access to settings" on user_settings;

-- 4. Enable RLS
alter table conversations enable row level security;
alter table messages enable row level security;
alter table user_settings enable row level security;

-- 5. Create Permissive Policies
create policy "Public access to conversations"
  on conversations for all
  using (true)
  with check (true);

create policy "Public access to messages"
  on messages for all
  using (true)
  with check (true);

create policy "Public access to settings"
  on user_settings for all
  using (true)
  with check (true);
