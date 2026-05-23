import {
  Package,
  Truck,
  Building2,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  type LucideIcon,
} from 'lucide-react';

export const STATUS_FLOW = [
  'postado',
  'coletado',
  'em_transito',
  'em_centro_distribuicao',
  'em_rota_entrega',
  'entregue',
] as const;

export const STATUS_EXCEPTION = [
  'tentativa_falha',
  'extraviado',
  'aguardando_retirada',
] as const;

export type StatusFlow = (typeof STATUS_FLOW)[number];
export type StatusException = (typeof STATUS_EXCEPTION)[number];
export type Status = StatusFlow | StatusException;

interface StatusMeta {
  label: string;
  color: string;        // tailwind bg class
  textColor: string;     // tailwind text class
  borderColor: string;
  icon: LucideIcon;
  isException: boolean;
}

export const STATUS_META: Record<Status, StatusMeta> = {
  postado: {
    label: 'Postado',
    color: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    icon: Package,
    isException: false,
  },
  coletado: {
    label: 'Coletado',
    color: 'bg-indigo-500/20',
    textColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/40',
    icon: Package,
    isException: false,
  },
  em_transito: {
    label: 'Em Trânsito',
    color: 'bg-amber-500/20',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    icon: Truck,
    isException: false,
  },
  em_centro_distribuicao: {
    label: 'Centro de Distribuição',
    color: 'bg-purple-500/20',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    icon: Building2,
    isException: false,
  },
  em_rota_entrega: {
    label: 'Em Rota de Entrega',
    color: 'bg-orange-500/20',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/40',
    icon: MapPin,
    isException: false,
  },
  entregue: {
    label: 'Entregue',
    color: 'bg-emerald-500/20',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    icon: CheckCircle2,
    isException: false,
  },
  tentativa_falha: {
    label: 'Tentativa de Entrega Falha',
    color: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/40',
    icon: AlertTriangle,
    isException: true,
  },
  extraviado: {
    label: 'Extraviado',
    color: 'bg-red-500/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/40',
    icon: XCircle,
    isException: true,
  },
  aguardando_retirada: {
    label: 'Aguardando Retirada',
    color: 'bg-cyan-500/20',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    icon: Clock,
    isException: true,
  },
};

export function nextStatus(current: Status): Status | null {
  const idx = STATUS_FLOW.indexOf(current as StatusFlow);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

export function progressPercent(current: Status): number {
  const idx = STATUS_FLOW.indexOf(current as StatusFlow);
  if (idx === -1) {
    // Exception statuses: find the last known flow position
    if (current === 'tentativa_falha' || current === 'aguardando_retirada') return 83; // near delivery
    if (current === 'extraviado') return 50;
    return 0;
  }
  return Math.round((idx / (STATUS_FLOW.length - 1)) * 100);
}

export function isValidStatus(s: string): s is Status {
  return (STATUS_FLOW as readonly string[]).includes(s) ||
    (STATUS_EXCEPTION as readonly string[]).includes(s);
}
