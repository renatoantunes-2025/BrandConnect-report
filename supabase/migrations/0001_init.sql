-- Brand Connect — schema inicial (clientes, contas sociais, uploads, posts)

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists social_accounts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'facebook')),
  external_account_id text not null,
  username text,
  display_name text,
  created_at timestamptz not null default now(),
  unique (client_id, platform, external_account_id)
);

create table if not exists report_uploads (
  id uuid primary key default gen_random_uuid(),
  social_account_id uuid not null references social_accounts(id) on delete cascade,
  uploaded_by uuid references auth.users(id),
  file_name text not null,
  period_start date,
  period_end date,
  uploaded_at timestamptz not null default now(),
  row_count integer not null default 0
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  social_account_id uuid not null references social_accounts(id) on delete cascade,
  upload_id uuid references report_uploads(id) on delete set null,
  external_post_id text not null,
  description text,
  post_type text,
  duration_seconds integer,
  permalink text,
  published_at timestamptz,
  views integer not null default 0,
  reach integer not null default 0,
  likes integer not null default 0,
  shares integer not null default 0,
  follows integer not null default 0,
  comments integer not null default 0,
  saves integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (social_account_id, external_post_id)
);

create index if not exists posts_social_account_published_idx
  on posts (social_account_id, published_at desc);

alter table clients enable row level security;
alter table social_accounts enable row level security;
alter table report_uploads enable row level security;
alter table posts enable row level security;

-- MVP: qualquer usuário autenticado (equipe interna da Brand Connect) tem
-- acesso total. Sem segmentação por cliente nesta fase.
create policy "authenticated full access" on clients
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on social_accounts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on report_uploads
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on posts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
