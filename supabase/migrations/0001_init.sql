-- ============================================
-- Rastreio System — Initial Schema
-- ============================================

-- Shipments table
create table if not exists shipments (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  servico text not null default 'Expresso',
  remetente_nome text not null,
  remetente_cidade text not null,
  remetente_uf text not null,
  destinatario_nome text not null,
  destinatario_cidade text not null,
  destinatario_uf text not null,
  peso_kg numeric not null default 0.5,
  status_atual text not null default 'postado',
  previsao_entrega date,
  created_at timestamptz not null default now(),
  demo_mode boolean not null default false
);

-- Tracking events table
create table if not exists tracking_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references shipments(id) on delete cascade,
  status text not null,
  descricao text not null,
  local_cidade text,
  local_uf text,
  ocorrido_em timestamptz not null,
  created_at timestamptz not null default now()
);

-- Index for fast timeline queries
create index if not exists idx_tracking_events_shipment_time
  on tracking_events (shipment_id, ocorrido_em desc);

-- Index for demo tick queries
create index if not exists idx_shipments_demo
  on shipments (demo_mode, status_atual);

-- ============================================
-- RLS Policies
-- ============================================

alter table shipments enable row level security;
alter table tracking_events enable row level security;

-- Public read access (anon can SELECT)
create policy "shipments_select_public"
  on shipments for select
  to anon, authenticated
  using (true);

create policy "tracking_events_select_public"
  on tracking_events for select
  to anon, authenticated
  using (true);

-- Service role can do everything (implicit, but explicit for clarity)
create policy "shipments_all_service"
  on shipments for all
  to service_role
  using (true)
  with check (true);

create policy "tracking_events_all_service"
  on tracking_events for all
  to service_role
  using (true)
  with check (true);
