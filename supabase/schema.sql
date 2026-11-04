-- =====================================================================
-- Painel Komvos: estrutura do banco (Supabase)
-- Como usar: Supabase → SQL Editor → cole este arquivo inteiro → Run.
-- Pode rodar de novo sem perder dados (tudo é "if not exists" / "or replace").
-- Os usuários do painel são gerenciados pelo próprio painel (Usuários), que usa /api/admin-users na Vercel.
-- =====================================================================

-- ---------- quem pode usar o painel ----------
create table if not exists public.admin_users (
  email text primary key,
  name text,
  created_at timestamptz not null default now()
);
-- admin: tudo, inclusive gerenciar usuários | editor: site, blog, leads e estatísticas
alter table public.admin_users add column if not exists role text not null default 'editor';
alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users add constraint admin_users_role_check check (role in ('admin', 'editor'));
alter table public.admin_users add column if not exists created_by text;
alter table public.admin_users add column if not exists tour_done boolean not null default false;
alter table public.admin_users enable row level security;

-- true quando o usuário logado está em admin_users
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- true quando o usuário logado é administrador geral (pode gerenciar usuários)
create or replace function public.is_super()
returns boolean
language sql
stable
security definer
set search_path = public
as $
  select exists (select 1 from public.admin_users where lower(email) = lower(auth.jwt() ->> 'email') and role = 'admin');
$;

drop policy if exists "admins leem admins" on public.admin_users;
create policy "admins leem admins" on public.admin_users for select using (public.is_admin());
drop policy if exists "admin geral gerencia usuários" on public.admin_users;
create policy "admin geral gerencia usuários" on public.admin_users for all using (public.is_super()) with check (public.is_super());

-- cada pessoa marca o próprio tutorial como visto
create or replace function public.finish_tour()
returns void
language sql
security definer
set search_path = public
as $
  update public.admin_users set tour_done = true where lower(email) = lower(auth.jwt() ->> 'email');
$;

-- ---------- leads (formulários do site) ----------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  form text not null,                -- contato | parceiro | trabalhe | ...
  name text,
  email text,
  phone text,
  company text,
  role text,
  message text,
  data jsonb not null default '{}',  -- todos os campos enviados
  page text,                         -- página onde o formulário foi enviado
  source text,                       -- origem da visita (google, instagram, direto...)
  utm jsonb,
  session_id text,
  status text not null default 'novo' check (status in ('novo', 'em_contato', 'qualificado', 'ganho', 'perdido')),
  notes text
);
alter table public.leads enable row level security;
create index if not exists leads_created_idx on public.leads (created_at desc);

drop policy if exists "site envia leads" on public.leads;
create policy "site envia leads" on public.leads for insert to anon, authenticated with check (status = 'novo' and notes is null);
drop policy if exists "admins gerenciam leads" on public.leads;
create policy "admins gerenciam leads" on public.leads for all using (public.is_admin()) with check (public.is_admin());

-- ---------- estatísticas (visitas e cliques) ----------
create table if not exists public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  type text not null check (type in ('pageview', 'click')),
  session_id text not null,
  visitor_id text,
  path text not null,
  landing boolean not null default false, -- primeira página da visita
  referrer text,
  source text,
  medium text,
  campaign text,
  device text,                            -- desktop | mobile | tablet
  country text,
  region text,
  city text,
  x real,                                 -- clique: posição horizontal (0 a 1 da largura)
  y real,                                 -- clique: posição vertical em px no documento
  page_h integer,
  vw integer,
  label text,                             -- clique: texto curto do elemento clicado
  fixed boolean not null default false    -- clique em parte fixa da tela (menu): y é a posição na tela
);
alter table public.events add column if not exists fixed boolean not null default false;
alter table public.events enable row level security;
create index if not exists events_created_idx on public.events (created_at desc);
create index if not exists events_path_idx on public.events (type, path, created_at desc);

drop policy if exists "site registra eventos" on public.events;
create policy "site registra eventos" on public.events for insert to anon, authenticated with check (type in ('pageview', 'click'));
drop policy if exists "admins leem eventos" on public.events;
create policy "admins leem eventos" on public.events for select using (public.is_admin());
drop policy if exists "admins apagam eventos" on public.events;
create policy "admins apagam eventos" on public.events for delete using (public.is_admin());

-- ---------- conteúdo editável (textos, imagens, menu, ajustes de artigos) ----------
-- key: "text:<caminho>", "image:<arquivo original>", "menu:<id>", "article:<slug>"
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);
alter table public.site_content enable row level security;

drop policy if exists "todos leem o conteúdo" on public.site_content;
create policy "todos leem o conteúdo" on public.site_content for select using (true);
drop policy if exists "admins editam o conteúdo" on public.site_content;
create policy "admins editam o conteúdo" on public.site_content for all using (public.is_admin()) with check (public.is_admin());

-- ---------- blog (artigos criados pelo painel) ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  title text not null,
  cat text not null,
  date_label text not null,
  read_time text not null default '5 min',
  excerpt text not null default '',
  body jsonb not null default '[]',   -- lista de parágrafos
  cover text,                         -- imagem de capa (opcional)
  status text not null default 'draft' check (status in ('draft', 'published')),
  hidden boolean not null default false,
  featured boolean not null default false
);
-- editor visual (blocos: título, parágrafo, imagem, botão, vídeo, link, autor…)
alter table public.posts add column if not exists blocks jsonb;
alter table public.posts add column if not exists author jsonb;   -- { name, role, avatar, url }
alter table public.posts enable row level security;

drop policy if exists "todos leem artigos publicados" on public.posts;
create policy "todos leem artigos publicados" on public.posts for select using ((status = 'published' and not hidden) or public.is_admin());
drop policy if exists "admins editam artigos" on public.posts;
create policy "admins editam artigos" on public.posts for all using (public.is_admin()) with check (public.is_admin());

-- ---------- arquivos ----------
-- site-media: imagens do site e capas (públicas); lead-files: currículos enviados (privados)
insert into storage.buckets (id, name, public) values ('site-media', 'site-media', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('lead-files', 'lead-files', false) on conflict (id) do nothing;

drop policy if exists "admins enviam mídia" on storage.objects;
create policy "admins enviam mídia" on storage.objects for insert to authenticated with check (bucket_id = 'site-media' and public.is_admin());
drop policy if exists "admins alteram mídia" on storage.objects;
create policy "admins alteram mídia" on storage.objects for update to authenticated using (bucket_id = 'site-media' and public.is_admin());
drop policy if exists "admins apagam mídia" on storage.objects;
create policy "admins apagam mídia" on storage.objects for delete to authenticated using (bucket_id in ('site-media', 'lead-files') and public.is_admin());
drop policy if exists "site envia currículos" on storage.objects;
create policy "site envia currículos" on storage.objects for insert to anon, authenticated with check (bucket_id = 'lead-files');
drop policy if exists "admins leem currículos" on storage.objects;
create policy "admins leem currículos" on storage.objects for select to authenticated using (bucket_id = 'lead-files' and public.is_admin());

-- ---------- administrador inicial ----------
-- O usuário (e-mail e senha) já foi criado em Authentication. Os próximos são criados pelo painel.
insert into public.admin_users (email, name, role) values ('acessos.marketing@senior-rp.com.br', 'Marketing Komvos', 'admin')
  on conflict (email) do update set role = 'admin';
