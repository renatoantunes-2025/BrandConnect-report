-- Séries de seguidores e snapshots de público, vindos dos exports de gráfico
-- individual do Meta Business Suite (Seguidores, Público) — diferente do
-- export em massa de posts.

create table if not exists follower_snapshots (
  id uuid primary key default gen_random_uuid(),
  social_account_id uuid not null references social_accounts(id) on delete cascade,
  snapshot_date date not null,
  followers integer not null,
  created_at timestamptz not null default now(),
  unique (social_account_id, snapshot_date)
);

create table if not exists audience_snapshots (
  id uuid primary key default gen_random_uuid(),
  social_account_id uuid not null references social_accounts(id) on delete cascade,
  captured_at date not null default current_date,
  age_gender jsonb not null default '[]',
  top_cities jsonb not null default '[]',
  top_countries jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table follower_snapshots enable row level security;
alter table audience_snapshots enable row level security;

create policy "authenticated full access" on follower_snapshots
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on audience_snapshots
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
