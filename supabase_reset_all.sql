-- ATENÇÃO: ESTE SCRIPT APAGA TODOS OS DADOS DO BANCO!
-- Use com cuidado.

-- 1. Dropar tabelas existentes (limpeza total)
drop table if exists messages cascade;
drop table if exists conversations cascade;
drop table if exists user_settings cascade;

-- 2. Recriar tabela de Configurações
create table user_settings (
  user_id text primary key,
  system_context text,
  theme text,
  created_at bigint default (extract(epoch from now()) * 1000)::bigint
);

-- 3. Recriar tabela de Conversas
create table conversations (
  id text primary key,
  user_id text not null,
  title text,
  updated_at bigint
);

-- 4. Recriar tabela de Mensagens
create table messages (
  id text primary key,
  conversation_id text references conversations(id) on delete cascade,
  role text,
  content text,
  timestamp bigint
);

-- 5. Configurar Segurança (RLS) - Modo "Permissivo" para Device ID
alter table user_settings enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Políticas para user_settings (Permite tudo para todos - ideal para protótipo sem login)
create policy "Public access to settings"
  on user_settings for all
  using (true)
  with check (true);

-- Políticas para conversations
create policy "Public access to conversations"
  on conversations for all
  using (true)
  with check (true);

-- Políticas para messages
create policy "Public access to messages"
  on messages for all
  using (true)
  with check (true);

-- 6. Garantir permissões de acesso aos roles do Supabase
grant all on user_settings to anon, authenticated, service_role;
grant all on conversations to anon, authenticated, service_role;
grant all on messages to anon, authenticated, service_role;
