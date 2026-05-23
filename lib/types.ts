import type { Status } from './status';

export interface Shipment {
  id: string;
  codigo: string;
  servico: string;
  remetente_nome: string;
  remetente_cidade: string;
  remetente_uf: string;
  destinatario_nome: string;
  destinatario_cidade: string;
  destinatario_uf: string;
  peso_kg: number;
  status_atual: Status;
  previsao_entrega: string | null;
  created_at: string;
  demo_mode: boolean;
}

export interface TrackingEvent {
  id: string;
  shipment_id: string;
  status: Status;
  descricao: string;
  local_cidade: string | null;
  local_uf: string | null;
  ocorrido_em: string;
  created_at: string;
}

export interface ShipmentWithEvents extends Shipment {
  tracking_events: TrackingEvent[];
}
