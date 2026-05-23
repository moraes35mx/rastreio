import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BRAND } from './brand';

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy", { locale: ptBR });
}

export function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0];
  return `${first} ${lastInitial}.`;
}

export function generateTrackingCode(): string {
  const digits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10)
  ).join('');
  return `${BRAND.codigoPrefix}${digits}${BRAND.codigoSuffix}`;
}
