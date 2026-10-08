-- Rota Livre: estado compartilhado entre o painel da organização e os apps dos participantes.
-- Acesso só pelo servidor (service role). RLS ligado e sem policies = anon não lê nem escreve.

create table public.festival_settings (
  id smallint primary key default 1 check (id = 1),
  clock_fixed_min real not null default 865, -- 14:25, relógio da simulação
  clock_set_at timestamptz not null default now(),
  auto_balance boolean not null default false,
  nudges integer not null default 0
);
insert into public.festival_settings default values;

create table public.venue_boosts (
  venue_id text primary key,
  level real not null check (level between 0 and 1),
  since timestamptz not null default now()
);

-- Check-ins anônimos por tag NFC (agregados no painel; sem rastreamento individual).
create table public.tag_taps (
  id bigint generated always as identity primary key,
  tag_id text not null,
  who text,
  created_at timestamptz not null default now()
);
create index tag_taps_created_at_idx on public.tag_taps (created_at desc);
create index tag_taps_tag_id_idx on public.tag_taps (tag_id);

alter table public.festival_settings enable row level security;
alter table public.venue_boosts enable row level security;
alter table public.tag_taps enable row level security;
