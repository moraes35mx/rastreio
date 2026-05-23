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
  Copy,
  Check,
  Package,
  Clock,
  ExternalLink,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { Timeline } from '@/components/Timeline';
import { formatDateTime, maskName } from '@/lib/format';
import {
  STATUS_FLOW,
  STATUS_EXCEPTION,
  STATUS_META,
  nextStatus,
  type Status,
} from '@/lib/status';
import type { ShipmentWithEvents } from '@/lib/types';

export default function AdminShipmentDetail() {
  const params = useParams();
  const id = params.id as string;

  const [shipment, setShipment] = useState<ShipmentWithEvents | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [toast, setToast] = useState('');
  const [copied, setCopied] = useState(false);

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
        setShipment(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

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
        showToast(`Avançado para: ${STATUS_META[data.new_status as Status]?.label}`);
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
        showToast(`Exceção: ${STATUS_META[status as Status]?.label}`);
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
      showToast('Erro ao adicionar');
    }
  }

  async function copyLink() {
    if (!shipment) return;
    await navigator.clipboard.writeText(`${window.location.origin}/rastreio/${shipment.codigo}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading || !shipment) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isDelivered = shipment.status_atual === 'entregue';
  const next = nextStatus(shipment.status_atual);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-2"
          >
            <Check size={14} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
        <Link href="/admin" className="hover:text-zinc-300 transition-colors flex items-center gap-1">
          <ArrowLeft size={14} />
          Encomendas
        </Link>
        <ChevronRight size={12} />
        <span className="text-zinc-300 font-mono">{shipment.codigo}</span>
      </div>

      {/* Header Card */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold font-mono text-zinc-100">{shipment.codigo}</h1>
              <StatusBadge status={shipment.status_atual} size="lg" />
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-400">
              <span>{shipment.servico}</span>
              <span>{shipment.remetente_cidade}/{shipment.remetente_uf} → {shipment.destinatario_cidade}/{shipment.destinatario_uf}</span>
              <span>{shipment.peso_kg} kg</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-zinc-500">
              <span>De: {shipment.remetente_nome}</span>
              <span>Para: {shipment.destinatario_nome}</span>
              <span>Criado: {formatDateTime(shipment.created_at)}</span>
              {shipment.previsao_entrega && <span>Previsão: {shipment.previsao_entrega}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-lg text-xs text-zinc-300 transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
            <Link
              href={`/rastreio/${shipment.codigo}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-lg text-xs text-zinc-300 transition-colors"
            >
              <ExternalLink size={13} />
              Ver público
            </Link>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6 pt-6 border-t border-zinc-800/50">
          <ProgressBar currentStatus={shipment.status_atual} />
        </div>
      </div>

      {/* Actions */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">Ações</h2>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleAdvance}
            disabled={isDelivered || actionLoading}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-semibold rounded-xl flex items-center gap-2 transition-colors text-sm"
          >
            <ChevronRight size={16} />
            {next ? `Avançar → ${STATUS_META[next]?.label}` : 'Status final'}
          </button>

          <div className="h-9 w-px bg-zinc-800 self-center mx-1" />

          <button
            onClick={() => handleException('tentativa_falha')}
            disabled={actionLoading}
            className="px-3.5 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-xl flex items-center gap-2 transition-colors text-sm"
          >
            <AlertTriangle size={14} />
            Tentativa falha
          </button>

          <button
            onClick={() => handleException('extraviado')}
            disabled={actionLoading}
            className="px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl flex items-center gap-2 transition-colors text-sm"
          >
            <AlertTriangle size={14} />
            Extraviado
          </button>

          <button
            onClick={() => handleException('aguardando_retirada')}
            disabled={actionLoading}
            className="px-3.5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl flex items-center gap-2 transition-colors text-sm"
          >
            <Clock size={14} />
            Aguardando retirada
          </button>

          <div className="h-9 w-px bg-zinc-800 self-center mx-1" />

          <button
            onClick={() => setShowEventForm(!showEventForm)}
            className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50 rounded-xl flex items-center gap-2 transition-colors text-sm"
          >
            <Plus size={14} />
            Evento manual
          </button>
        </div>
      </div>

      {/* Manual Event Form */}
      <AnimatePresence>
        {showEventForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleAddEvent}
              className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Evento manual</h3>
                <button type="button" onClick={() => setShowEventForm(false)} className="p-1 text-zinc-500 hover:text-zinc-300">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Status</label>
                  <select
                    value={eventForm.status}
                    onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
                  >
                    {[...STATUS_FLOW, ...STATUS_EXCEPTION].map((s) => (
                      <option key={s} value={s}>{STATUS_META[s].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Data/Hora</label>
                  <input
                    type="datetime-local"
                    value={eventForm.ocorrido_em}
                    onChange={(e) => setEventForm({ ...eventForm, ocorrido_em: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Descrição</label>
                <input
                  required
                  value={eventForm.descricao}
                  onChange={(e) => setEventForm({ ...eventForm, descricao: e.target.value })}
                  placeholder="Ex: Objeto recebido na unidade de triagem"
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <input
                  value={eventForm.local_cidade}
                  onChange={(e) => setEventForm({ ...eventForm, local_cidade: e.target.value })}
                  placeholder="Cidade"
                  className="col-span-3 px-3 py-2.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                />
                <input
                  maxLength={2}
                  value={eventForm.local_uf}
                  onChange={(e) => setEventForm({ ...eventForm, local_uf: e.target.value.toUpperCase() })}
                  placeholder="UF"
                  className="px-3 py-2.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 text-center"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-black text-sm font-semibold rounded-xl transition-colors"
              >
                Adicionar
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-5 uppercase tracking-wider">
          Histórico ({shipment.tracking_events.length} evento{shipment.tracking_events.length !== 1 ? 's' : ''})
        </h2>
        {shipment.tracking_events.length > 0 ? (
          <Timeline events={shipment.tracking_events} />
        ) : (
          <div className="text-center py-12 text-zinc-500 text-sm">Nenhum evento registrado</div>
        )}
      </div>
    </div>
  );
}
