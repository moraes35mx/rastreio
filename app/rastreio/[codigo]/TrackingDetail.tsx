'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import type { Shipment, TrackingEvent } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { Timeline } from '@/components/Timeline';
import { ShipmentSummary } from '@/components/ShipmentSummary';
import { ShareButton } from '@/components/ShareButton';

interface TrackingDetailProps {
  shipment: Shipment;
  events: TrackingEvent[];
}

export function TrackingDetail({ shipment, events }: TrackingDetailProps) {
  return (
    <main className="flex-1 flex flex-col">
      {/* Header bar */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            {BRAND.name}
          </Link>
          <ShareButton />
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Title + Badge */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
              {shipment.codigo}
            </h1>
            <StatusBadge status={shipment.status_atual} size="lg" />
          </div>
          <p className="text-sm text-zinc-500">
            Serviço: {shipment.servico}
          </p>
        </div>

        {/* Progress Bar */}
        <section>
          <ProgressBar currentStatus={shipment.status_atual} />
        </section>

        {/* Summary Cards */}
        <section>
          <ShipmentSummary shipment={shipment} />
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-200 mb-4">
            Histórico de movimentação
          </h2>
          {events.length > 0 ? (
            <Timeline events={events} />
          ) : (
            <div className="text-center py-12 text-zinc-500">
              Nenhum evento registrado ainda.
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-xs text-zinc-600 border-t border-zinc-800/50">
        {BRAND.name} &copy; {new Date().getFullYear()}
      </footer>
    </main>
  );
}
