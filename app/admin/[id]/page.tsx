'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  Plus,
  Eye,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { Timeline } from '@/components/Timeline';
import { formatDateTime } from '@/lib/format';
import { STATUS_FLOW, STATUS_EXCEPTION, STATUS_META, type Status } from '@/lib/status';
import type { ShipmentWithEvents } from '@/lib/types';

export default function AdminShipmentDetail() {
  const params = useParams();
  const id = params.id as string;

  const [shipment, setShipment] = useState<ShipmentWithEvents | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [toast, setToast] = useState('');

  // Event form
  const [eventForm, setEventForm] = useState({
    status: 'em_transito',
    descricao: '',
    local_cidade: '',
    local_uf: '',
    ocorrido_em: new Date().toISOString().slice(0, 16),
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/shipments/${id}`);
      if (res.ok) {
        const data = await res.json();
        setShipment(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleAdvance() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/shipments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance' }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Status avançado para: ${STATUS_META[data.new_status as Status]?.label}`);
        load();
      } else {
        showToast(data.error || 'Erro');
      }
    } catch {
      showToast('Erro de conexão');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleException(status: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/shipments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'exception', status }),
      });
      if (res.ok) {
        showToast(`Exceção registrada: ${STATUS_META[status as Status]?.label}`);
        load();
      }
    } catch {
      showToast('Erro de conexão');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipment_id: id,
          ...eventForm,
          ocorrido_em: new Date(eventForm.ocorrido_em).toISOString(),
        }),
      });
      if (res.ok) {
        showToast('Evento adicionado');
        setShowEventForm(false);
        setEventForm({
          status: 'em_transito',
          descricao: '',
          local_cidade: '',
          local_uf: '',
          ocorrido_em: new Date().toISOString().slice(0, 16),
        });
        load();
      }
    } catch {
      showToast('Erro ao adicionar evento');
    }
  }

  if (loading || !shipment) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Carregando...</div>
      </main>
    );
  }

  const isDelivered = shipment.status_atual === 'entregue';

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 py-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin"
          className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-mono text-zinc-100">
              {shipment.codigo}
            </h1>
            <StatusBadge status={shipment.status_atual} />
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            {shipment.remetente_cidade}/{shipment.remetente_uf} → {shipment.destinatario_cidade}/{shipment.destinatario_uf}
            {' · '}Criado em {formatDateTime(shipment.created_at)}
          </p>
        </div>
        <Link
          href={`/rastreio/${shipment.codigo}`}
          target="_blank"
          className="p-2 text-zinc-400 hover:text-emerald-400 transition-colors"
          title="Ver rastreio público"
        >
          <Eye size={20} />
        </Link>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={handleAdvance}
          disabled={isDelivered || actionLoading}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-medium rounded-lg flex items-center gap-2 transition-colors text-sm"
        >
          <ChevronRight size={16} />
          Avançar Status
        </button>

        <button
          onClick={() => handleException('tentativa_falha')}
          disabled={actionLoading}
          className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/30 font-medium rounded-lg flex items-center gap-2 transition-colors text-sm"
        >
          <AlertTriangle size={16} />
          Tentativa Falha
        </button>

        <button
          onClick={() => handleException('extraviado')}
          disabled={actionLoading}
          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 font-medium rounded-lg flex items-center gap-2 transition-colors text-sm"
        >
          <AlertTriangle size={16} />
          Extraviado
        </button>

        <button
          onClick={() => handleException('aguardando_retirada')}
          disabled={actionLoading}
          className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-600/30 font-medium rounded-lg flex items-center gap-2 transition-colors text-sm"
        >
          <Package size={16} />
          Aguardando Retirada
        </button>

        <button
          onClick={() => setShowEventForm(!showEventForm)}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-medium rounded-lg flex items-center gap-2 transition-colors text-sm"
        >
          <Plus size={16} />
          Evento Manual
        </button>
      </div>

      {/* Manual event form */}
      <AnimatePresence>
        {showEventForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddEvent}
            className="mb-8 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4 overflow-hidden"
          >
            <h3 className="text-sm font-medium text-zinc-300">Adicionar Evento Manual</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Status</label>
                <select
                  value={eventForm.status}
                  onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-amber-500/50"
                >
                  {[...STATUS_FLOW, ...STATUS_EXCEPTION].map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Data/Hora</label>
                <input
                  type="datetime-local"
                  value={eventForm.ocorrido_em}
                  onChange={(e) => setEventForm({ ...eventForm, ocorrido_em: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Descrição</label>
              <input
                required
                value={eventForm.descricao}
                onChange={(e) => setEventForm({ ...eventForm, descricao: e.target.value })}
                placeholder="Descrição do evento"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <input
                value={eventForm.local_cidade}
                onChange={(e) => setEventForm({ ...eventForm, local_cidade: e.target.value })}
                placeholder="Cidade"
                className="col-span-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
              <input
                maxLength={2}
                value={eventForm.local_uf}
                onChange={(e) => setEventForm({ ...eventForm, local_uf: e.target.value.toUpperCase() })}
                placeholder="UF"
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black text-sm font-medium rounded-lg transition-colors"
            >
              Adicionar Evento
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-200 mb-4">Eventos</h2>
        {shipment.tracking_events.length > 0 ? (
          <Timeline events={shipment.tracking_events} />
        ) : (
          <p className="text-zinc-500 text-center py-8">Nenhum evento</p>
        )}
      </section>
    </main>
  );
}
