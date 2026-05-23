'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Copy,
  Check,
  Eye,
  Settings,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDateTime } from '@/lib/format';
import { STATUS_META, type Status } from '@/lib/status';
import type { Shipment } from '@/lib/types';

type FilterStatus = 'all' | 'active' | 'delivered' | 'exception';

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const showNew = searchParams.get('new') === '1';

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(showNew);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const [form, setForm] = useState({
    servico: 'Expresso',
    remetente_nome: '',
    remetente_cidade: '',
    remetente_uf: '',
    destinatario_nome: '',
    destinatario_cidade: '',
    destinatario_uf: '',
    peso_kg: '0.5',
    previsao_entrega: '',
    demo_mode: false,
  });

  const loadShipments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shipments');
      if (res.ok) {
        const data = await res.json();
        setShipments(data);
      } else {
        const err = await res.json().catch(() => ({ error: 'Erro ao carregar encomendas' }));
        setError(err.error || 'Erro ao carregar encomendas');
      }
    } catch {
      setError('Erro de conexão ao carregar encomendas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  useEffect(() => {
    if (showNew) setShowCreateModal(true);
  }, [showNew]);

  const stats = useMemo(() => {
    const total = shipments.length;
    const active = shipments.filter(
      (s) => !['entregue', 'tentativa_falha', 'extraviado'].includes(s.status_atual)
    ).length;
    const delivered = shipments.filter((s) => s.status_atual === 'entregue').length;
    const exceptions = shipments.filter((s) =>
      ['tentativa_falha', 'extraviado', 'aguardando_retirada'].includes(s.status_atual)
    ).length;
    return { total, active, delivered, exceptions };
  }, [shipments]);

  const filtered = useMemo(() => {
    let list = shipments;

    if (filter === 'active') {
      list = list.filter(
        (s) => !['entregue', 'tentativa_falha', 'extraviado', 'aguardando_retirada'].includes(s.status_atual)
      );
    } else if (filter === 'delivered') {
      list = list.filter((s) => s.status_atual === 'entregue');
    } else if (filter === 'exception') {
      list = list.filter((s) =>
        ['tentativa_falha', 'extraviado', 'aguardando_retirada'].includes(s.status_atual)
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.codigo.toLowerCase().includes(q) ||
          s.destinatario_nome.toLowerCase().includes(q) ||
          s.destinatario_cidade.toLowerCase().includes(q) ||
          s.remetente_nome.toLowerCase().includes(q)
      );
    }

    return list;
  }, [shipments, filter, search]);

  async function copyCode(codigo: string) {
    await navigator.clipboard.writeText(codigo);
    setCopiedId(codigo);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function copyTrackingLink(codigo: string) {
    const url = `${window.location.origin}/rastreio/${codigo}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(`link-${codigo}`);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          peso_kg: parseFloat(form.peso_kg),
          previsao_entrega: form.previsao_entrega || null,
        }),
      });
      if (res.ok) {
        const newShipment = await res.json();
        const codigo = newShipment.codigo;
        setShowCreateModal(false);
        router.replace('/admin');
        setForm({
          servico: 'Expresso',
          remetente_nome: '',
          remetente_cidade: '',
          remetente_uf: '',
          destinatario_nome: '',
          destinatario_cidade: '',
          destinatario_uf: '',
          peso_kg: '0.5',
          previsao_entrega: '',
          demo_mode: false,
        });
        setSuccessCode(codigo);
        setTimeout(() => setSuccessCode(null), 6000);
        loadShipments();
        try {
          await navigator.clipboard.writeText(codigo);
          setCopiedId(codigo);
          setTimeout(() => setCopiedId(null), 3000);
        } catch {
          // Clipboard pode falhar em HTTP - o toast de sucesso já mostra o código
        }
      } else {
        const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
        setError(err.error || `Erro ${res.status} ao criar encomenda`);
      }
    } catch (err) {
      setError(`Erro de conexão: ${err instanceof Error ? err.message : 'falha na requisição'}`);
    } finally {
      setCreating(false);
    }
  }

  const statCards = [
    { label: 'Total', value: stats.total, icon: Package, color: 'text-zinc-300', bg: 'bg-zinc-800/50', onClick: () => setFilter('all') },
    { label: 'Em andamento', value: stats.active, icon: Truck, color: 'text-amber-400', bg: 'bg-amber-500/10', onClick: () => setFilter('active') },
    { label: 'Entregues', value: stats.delivered, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', onClick: () => setFilter('delivered') },
    { label: 'Exceções', value: stats.exceptions, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', onClick: () => setFilter('exception') },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Encomendas</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Gerencie e acompanhe todas as entregas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-black text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus size={16} />
          Nova encomenda
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map((card) => (
          <button
            key={card.label}
            onClick={card.onClick}
            className={`text-left p-4 rounded-xl border transition-all ${
              (filter === 'all' && card.label === 'Total') ||
              (filter === 'active' && card.label === 'Em andamento') ||
              (filter === 'delivered' && card.label === 'Entregues') ||
              (filter === 'exception' && card.label === 'Exceções')
                ? 'border-amber-500/40 bg-zinc-900/80'
                : 'border-zinc-800/50 bg-zinc-900/40 hover:border-zinc-700/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon size={16} className={card.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">{card.value}</p>
                <p className="text-xs text-zinc-500">{card.label}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, nome ou cidade..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800/50 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 px-1 py-1 bg-zinc-900/60 border border-zinc-800/50 rounded-xl">
          {(['all', 'active', 'delivered', 'exception'] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {{ all: 'Todos', active: 'Ativos', delivered: 'Entregues', exception: 'Exceções' }[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900/60">
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Código</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider hidden md:table-cell">Destinatário</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider hidden lg:table-cell">Rota</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider hidden xl:table-cell">Criado</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {filtered.map((s, idx) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-zinc-800/20 transition-colors group"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <code className="text-amber-400 font-mono text-xs font-medium">{s.codigo}</code>
                      <button
                        onClick={() => copyCode(s.codigo)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-500 hover:text-zinc-300"
                        title="Copiar código"
                      >
                        {copiedId === s.codigo ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={s.status_atual as Status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <p className="text-zinc-300 text-sm">{s.destinatario_nome}</p>
                    <p className="text-zinc-600 text-xs">{s.destinatario_cidade}/{s.destinatario_uf}</p>
                  </td>
                  <td className="px-4 py-3.5 text-zinc-400 hidden lg:table-cell">
                    <span className="text-xs">
                      {s.remetente_cidade}/{s.remetente_uf} → {s.destinatario_cidade}/{s.destinatario_uf}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-zinc-500 text-xs hidden xl:table-cell">
                    {formatDateTime(s.created_at)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => copyTrackingLink(s.codigo)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Copiar link de rastreio"
                      >
                        {copiedId === `link-${s.codigo}` ? <Check size={14} className="text-emerald-400" /> : <ExternalLink size={14} />}
                      </button>
                      <Link
                        href={`/rastreio/${s.codigo}`}
                        target="_blank"
                        className="p-1.5 text-zinc-500 hover:text-emerald-400 transition-colors"
                        title="Ver rastreio público"
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        href={`/admin/${s.id}`}
                        className="p-1.5 text-zinc-500 hover:text-amber-400 transition-colors"
                        title="Gerenciar"
                      >
                        <Settings size={14} />
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-16 space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800/60">
              {search ? <Search size={20} className="text-zinc-600" /> : <Package size={20} className="text-zinc-600" />}
            </div>
            <p className="text-sm text-zinc-500">
              {search ? 'Nenhum resultado para essa busca' : 'Nenhuma encomenda cadastrada'}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                Criar primeira encomenda
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-16">
            <div className="w-6 h-6 mx-auto border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-600 mt-3 text-right">
        {filtered.length} de {shipments.length} encomenda{shipments.length !== 1 ? 's' : ''}
      </p>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => { setShowCreateModal(false); router.replace('/admin'); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[5%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-auto sm:w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl"
            >
              <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-lg font-bold text-zinc-100">Nova encomenda</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">O código será gerado automaticamente</p>
                </div>
                <button
                  onClick={() => { setShowCreateModal(false); router.replace('/admin'); }}
                  className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-5">
                {/* Serviço */}
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Serviço</label>
                  <select
                    value={form.servico}
                    onChange={(e) => setForm({ ...form, servico: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Expresso">Expresso</option>
                    <option value="Econômico">Econômico</option>
                    <option value="Same Day">Same Day</option>
                  </select>
                </div>

                {/* Remetente */}
                <fieldset className="space-y-3">
                  <legend className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Remetente</legend>
                  <input
                    required
                    value={form.remetente_nome}
                    onChange={(e) => setForm({ ...form, remetente_nome: e.target.value })}
                    placeholder="Nome completo"
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      required
                      value={form.remetente_cidade}
                      onChange={(e) => setForm({ ...form, remetente_cidade: e.target.value })}
                      placeholder="Cidade"
                      className="col-span-3 px-3.5 py-2.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                    />
                    <input
                      required
                      maxLength={2}
                      value={form.remetente_uf}
                      onChange={(e) => setForm({ ...form, remetente_uf: e.target.value.toUpperCase() })}
                      placeholder="UF"
                      className="px-3.5 py-2.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 text-center"
                    />
                  </div>
                </fieldset>

                {/* Destinatário */}
                <fieldset className="space-y-3">
                  <legend className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Destinatário</legend>
                  <input
                    required
                    value={form.destinatario_nome}
                    onChange={(e) => setForm({ ...form, destinatario_nome: e.target.value })}
                    placeholder="Nome completo"
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      required
                      value={form.destinatario_cidade}
                      onChange={(e) => setForm({ ...form, destinatario_cidade: e.target.value })}
                      placeholder="Cidade"
                      className="col-span-3 px-3.5 py-2.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                    />
                    <input
                      required
                      maxLength={2}
                      value={form.destinatario_uf}
                      onChange={(e) => setForm({ ...form, destinatario_uf: e.target.value.toUpperCase() })}
                      placeholder="UF"
                      className="px-3.5 py-2.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 text-center"
                    />
                  </div>
                </fieldset>

                {/* Peso + Previsão */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={form.peso_kg}
                      onChange={(e) => setForm({ ...form, peso_kg: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Previsão</label>
                    <input
                      type="date"
                      value={form.previsao_entrega}
                      onChange={(e) => setForm({ ...form, previsao_entrega: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                    <AlertTriangle size={16} className="shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 text-black font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {creating ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={18} />
                      Gerar código e criar
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success toast */}
      <AnimatePresence>
        {successCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-3 shadow-lg"
          >
            <CheckCircle2 size={18} />
            <div>
              <p className="font-semibold">Encomenda criada!</p>
              <p className="text-xs text-emerald-400/80 mt-0.5">Código: <code className="font-mono">{successCode}</code></p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(successCode).catch(() => {});
                setCopiedId(successCode);
                setTimeout(() => setCopiedId(null), 2000);
              }}
              className="ml-2 p-1.5 hover:bg-emerald-500/20 rounded-lg transition-colors"
              title="Copiar código"
            >
              {copiedId === successCode ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-3 shadow-lg max-w-md"
          >
            <AlertTriangle size={18} className="shrink-0" />
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-2 p-1 hover:bg-red-500/20 rounded-lg transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copied toast */}
      <AnimatePresence>
        {copiedId && !successCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-2 shadow-lg"
          >
            <Check size={14} />
            {copiedId.startsWith('link-') ? 'Link copiado!' : `Código ${copiedId} copiado!`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
