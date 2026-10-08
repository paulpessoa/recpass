-- Pesquisa de feedback dos profissionais que testam o app no congresso.
-- Só o servidor grava (service role). RLS ligado e sem policies = anon não lê nem escreve.

create table public.app_feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  rating smallint not null check (rating between 1 and 5),       -- nota geral
  recommend smallint check (recommend between 0 and 10),          -- NPS
  would_use text check (would_use in ('sim', 'talvez', 'nao')),   -- usaria no REC'n'Play?
  liked text[] not null default '{}',                             -- o que mais gostou (chips)
  missing text,                                                   -- o que faltou / onde travou
  area text,                                                      -- área de atuação
  role text,                                                      -- cargo/profissão (livre)
  name text,
  contact text,                                                   -- e-mail ou WhatsApp, opcional
  can_contact boolean not null default false,
  context jsonb not null default '{}'                             -- página, tag, perfil escolhido no app
);
create index app_feedback_created_at_idx on public.app_feedback (created_at desc);

alter table public.app_feedback enable row level security;
