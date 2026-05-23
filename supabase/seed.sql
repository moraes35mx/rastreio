-- ============================================
-- Seed Data — Demo Shipments
-- ============================================
-- 5 demo shipments in various states for demonstration

-- 1. ENTREGUE — TR482917365BR
insert into shipments (id, codigo, servico, remetente_nome, remetente_cidade, remetente_uf, destinatario_nome, destinatario_cidade, destinatario_uf, peso_kg, status_atual, previsao_entrega, created_at, demo_mode)
values (
  'a1111111-1111-1111-1111-111111111111',
  'TR482917365BR', 'Expresso',
  'Carlos Mendes', 'São Paulo', 'SP',
  'Ana Beatriz Oliveira', 'Rio de Janeiro', 'RJ',
  2.3, 'entregue',
  (now() - interval '1 day')::date,
  now() - interval '7 days',
  false
);

insert into tracking_events (shipment_id, status, descricao, local_cidade, local_uf, ocorrido_em) values
('a1111111-1111-1111-1111-111111111111', 'postado', 'Objeto postado na agência', 'São Paulo', 'SP', now() - interval '7 days'),
('a1111111-1111-1111-1111-111111111111', 'coletado', 'Objeto coletado na unidade de origem', 'São Paulo', 'SP', now() - interval '6 days 18 hours'),
('a1111111-1111-1111-1111-111111111111', 'em_transito', 'Objeto em trânsito — de São Paulo/SP para Rio de Janeiro/RJ', 'São Paulo', 'SP', now() - interval '5 days 12 hours'),
('a1111111-1111-1111-1111-111111111111', 'em_centro_distribuicao', 'Objeto recebido no centro de distribuição', 'Rio de Janeiro', 'RJ', now() - interval '3 days 6 hours'),
('a1111111-1111-1111-1111-111111111111', 'em_rota_entrega', 'Objeto saiu para entrega ao destinatário', 'Rio de Janeiro', 'RJ', now() - interval '2 days'),
('a1111111-1111-1111-1111-111111111111', 'entregue', 'Objeto entregue ao destinatário', 'Rio de Janeiro', 'RJ', now() - interval '1 day 20 hours');

-- 2. EM ROTA DE ENTREGA — TR739150284BR
insert into shipments (id, codigo, servico, remetente_nome, remetente_cidade, remetente_uf, destinatario_nome, destinatario_cidade, destinatario_uf, peso_kg, status_atual, previsao_entrega, created_at, demo_mode)
values (
  'b2222222-2222-2222-2222-222222222222',
  'TR739150284BR', 'Same Day',
  'Fernanda Costa', 'Curitiba', 'PR',
  'Roberto Silva', 'Florianópolis', 'SC',
  0.8, 'em_rota_entrega',
  (now() + interval '1 day')::date,
  now() - interval '4 days',
  false
);

insert into tracking_events (shipment_id, status, descricao, local_cidade, local_uf, ocorrido_em) values
('b2222222-2222-2222-2222-222222222222', 'postado', 'Objeto postado na agência', 'Curitiba', 'PR', now() - interval '4 days'),
('b2222222-2222-2222-2222-222222222222', 'coletado', 'Objeto coletado na unidade de origem', 'Curitiba', 'PR', now() - interval '3 days 20 hours'),
('b2222222-2222-2222-2222-222222222222', 'em_transito', 'Objeto em trânsito — de Curitiba/PR para Florianópolis/SC', 'Curitiba', 'PR', now() - interval '3 days'),
('b2222222-2222-2222-2222-222222222222', 'em_centro_distribuicao', 'Objeto recebido no centro de distribuição', 'Florianópolis', 'SC', now() - interval '1 day 12 hours'),
('b2222222-2222-2222-2222-222222222222', 'em_rota_entrega', 'Objeto saiu para entrega ao destinatário', 'Florianópolis', 'SC', now() - interval '6 hours');

-- 3. EM TRÂNSITO (recém postado) — TR615823947BR
insert into shipments (id, codigo, servico, remetente_nome, remetente_cidade, remetente_uf, destinatario_nome, destinatario_cidade, destinatario_uf, peso_kg, status_atual, previsao_entrega, created_at, demo_mode)
values (
  'c3333333-3333-3333-3333-333333333333',
  'TR615823947BR', 'Econômico',
  'Marcos Paulo Ferreira', 'Belo Horizonte', 'MG',
  'Juliana Almeida', 'Salvador', 'BA',
  5.1, 'em_transito',
  (now() + interval '4 days')::date,
  now() - interval '2 days',
  true
);

insert into tracking_events (shipment_id, status, descricao, local_cidade, local_uf, ocorrido_em) values
('c3333333-3333-3333-3333-333333333333', 'postado', 'Objeto postado na agência', 'Belo Horizonte', 'MG', now() - interval '2 days'),
('c3333333-3333-3333-3333-333333333333', 'coletado', 'Objeto coletado na unidade de origem', 'Belo Horizonte', 'MG', now() - interval '1 day 18 hours'),
('c3333333-3333-3333-3333-333333333333', 'em_transito', 'Objeto em trânsito — de Belo Horizonte/MG para Salvador/BA', 'Belo Horizonte', 'MG', now() - interval '1 day');

-- 4. EXCEÇÃO (tentativa falha) — TR204867531BR
insert into shipments (id, codigo, servico, remetente_nome, remetente_cidade, remetente_uf, destinatario_nome, destinatario_cidade, destinatario_uf, peso_kg, status_atual, previsao_entrega, created_at, demo_mode)
values (
  'd4444444-4444-4444-4444-444444444444',
  'TR204867531BR', 'Expresso',
  'Luciana Braga', 'Recife', 'PE',
  'Diego Nascimento', 'Fortaleza', 'CE',
  1.2, 'tentativa_falha',
  (now() + interval '2 days')::date,
  now() - interval '5 days',
  false
);

insert into tracking_events (shipment_id, status, descricao, local_cidade, local_uf, ocorrido_em) values
('d4444444-4444-4444-4444-444444444444', 'postado', 'Objeto postado na agência', 'Recife', 'PE', now() - interval '5 days'),
('d4444444-4444-4444-4444-444444444444', 'coletado', 'Objeto coletado na unidade de origem', 'Recife', 'PE', now() - interval '4 days 16 hours'),
('d4444444-4444-4444-4444-444444444444', 'em_transito', 'Objeto em trânsito — de Recife/PE para Fortaleza/CE', 'Recife', 'PE', now() - interval '4 days'),
('d4444444-4444-4444-4444-444444444444', 'em_centro_distribuicao', 'Objeto recebido no centro de distribuição', 'Fortaleza', 'CE', now() - interval '2 days'),
('d4444444-4444-4444-4444-444444444444', 'em_rota_entrega', 'Objeto saiu para entrega ao destinatário', 'Fortaleza', 'CE', now() - interval '1 day 6 hours'),
('d4444444-4444-4444-4444-444444444444', 'tentativa_falha', 'Tentativa de entrega não realizada — destinatário ausente', 'Fortaleza', 'CE', now() - interval '1 day');

-- 5. POSTADO (acabou de entrar, demo_mode ativado) — TR378491026BR
insert into shipments (id, codigo, servico, remetente_nome, remetente_cidade, remetente_uf, destinatario_nome, destinatario_cidade, destinatario_uf, peso_kg, status_atual, previsao_entrega, created_at, demo_mode)
values (
  'e5555555-5555-5555-5555-555555555555',
  'TR378491026BR', 'Same Day',
  'Patricia Lemos', 'Porto Alegre', 'RS',
  'Thiago Moreira', 'Brasília', 'DF',
  0.3, 'postado',
  (now() + interval '3 days')::date,
  now() - interval '3 hours',
  true
);

insert into tracking_events (shipment_id, status, descricao, local_cidade, local_uf, ocorrido_em) values
('e5555555-5555-5555-5555-555555555555', 'postado', 'Objeto postado na agência', 'Porto Alegre', 'RS', now() - interval '3 hours');
