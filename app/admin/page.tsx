'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn,
  Plus,
  Play,
  RefreshCw,
  Package,
  Eye,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDateTime } from '@/lib/format';
import type { Shipment } from '@/lib/types';
import type { Status } from '@/lib/status';

type View = 'login' | 'list' | 'create';

export default function AdminPage() {
  const [view, setView] = useState<View>('login');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [tickResult, setTickResult] = useState('');

  // Form state
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
      if (res.status === 401) {
        setView('login');
        return;
      }
      const data = await res.json();
      setShipments(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'list') {
      loadShipments();
    }
  }, [view, loadShipments]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError('Senha incorreta');
        return;
      }
      setView('list');
    } catch {
      setError('Erro de conexão');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
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
        setView('list');
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
      }
    } catch {
      // ignore
    }
  }

  async function handleTick() {
    try {
      const res = await fetch('/api/demo/tick', { method: 'POST' });
      const data = await res.json();
      setTickResult(data.message || 'Tick executado');
      setTimeout(() => setTickResult(''), 3000);
      loadShipments();
    } catch {
      setTickResult('Erro ao executar tick');
    }
  }

  async function toggleDemoMode(id: string, current: boolean) {
    await fetch(`/api/admin/shipments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demo_mode: !current }),
    });
    loadShipments();
  }

  // Login
  if (view === 'login') {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-amber-400">{BRAND.name}</h1>
            <p className="text-zinc-500 text-sm mt-1">Painel Administrativo</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de acesso"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn size={18} />
              Entrar
            </button>
          </form>
          <Link
            href="/"
            className="block text-center text-sm text-zinc-500 mt-4 hover:text-zinc-300 transition-colors"
          >
            Voltar ao site
          </Link>
        </motion.div>
      </main>
    );
  }

  // Create form
  if (view === 'create') {
    return (
      <main className="flex-1 max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-zinc-100">Nova Encomenda</h1>
          <button
            onClick={() => setView('list')}
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Voltar
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          {/* Serviço */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Serviço</label>
            <select
              value={form.servico}
              onChange={(e) => setForm({ ...form, servico: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:border-amber-500/50"
            >
              <option value="Expresso">Expresso</option>
              <option value="Econômico">Econômico</option>
              <option value="Same Day">Same Day</option>
            </select>
          </div>

          {/* Remetente */}
          <fieldset className="space-y-3">
            <legend className="text-sm text-amber-400 font-medium">Remetente</legend>
            <input
              required
              value={form.remetente_nome}
              onChange={(e) => setForm({ ...form, remetente_nome: e.target.value })}
              placeholder="Nome completo"
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                required
                value={form.remetente_cidade}
                onChange={(e) => setForm({ ...form, remetente_cidade: e.target.value })}
                placeholder="Cidade"
                className="col-span-2 px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
              <input
                required
                maxLength={2}
                value={form.remetente_uf}
                onChange={(e) => setForm({ ...form, remetente_uf: e.target.value.toUpperCase() })}
                placeholder="UF"
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </fieldset>

          {/* Destinatário */}
          <fieldset className="space-y-3">
            <legend className="text-sm text-amber-400 font-medium">Destinatário</legend>
            <input
              required
              value={form.destinatario_nome}
              onChange={(e) => setForm({ ...form, destinatario_nome: e.target.value })}
              placeholder="Nome completo"
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                required
                value={form.destinatario_cidade}
                onChange={(e) => setForm({ ...form, destinatario_cidade: e.target.value })}
                placeholder="Cidade"
                className="col-span-2 px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
              <input
                required
                maxLength={2}
                value={form.destinatario_uf}
                onChange={(e) => setForm({ ...form, destinatario_uf: e.target.value.toUpperCase() })}
                placeholder="UF"
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </fieldset>

          {/* Peso + Previsão */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={form.peso_kg}
                onChange={(e) => setForm({ ...form, peso_kg: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Previsão de entrega</label>
              <input
                type="date"
                value={form.previsao_entrega}
                onChange={(e) => setForm({ ...form, previsao_entrega: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Demo mode */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.demo_mode}
              onChange={(e) => setForm({ ...form, demo_mode: e.target.checked })}
              className="sr-only"
            />
            {form.demo_mode ? (
              <ToggleRight size={28} className="text-amber-400" />
            ) : (
              <ToggleLeft size={28} className="text-zinc-500" />
            )}
            <span className="text-sm text-zinc-300">Modo demo (avanço automático)</span>
          </label>

          <button
            type="submit"
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Criar Encomenda
          </button>
        </form>
      </main>
    );
  }

  // List
  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Painel Admin</h1>
          <p className="text-sm text-zinc-500">{BRAND.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTick}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            <Play size={14} />
            Simular Tick
          </button>
          <button
            onClick={() => setView('create')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={14} />
            Nova Encomenda
          </button>
          <button
            onClick={loadShipments}
            className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tick result toast */}
      <AnimatePresence>
        {tickResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 text-sm"
          >
            {tickResult}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-900/80">
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Código</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">Destino</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden lg:table-cell">Criado em</th>
              <th className="text-center px-4 py-3 text-zinc-400 font-medium">Demo</th>
              <th className="text-center px-4 py-3 text-zinc-400 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {shipments.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-900/40 transition-colors">
                <td className="px-4 py-3">
                  <code className="text-amber-400 font-mono text-xs">{s.codigo}</code>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status_atual as Status} size="sm" />
                </td>
                <td className="px-4 py-3 text-zinc-300 hidden md:table-cell">
                  {s.destinatario_cidade}/{s.destinatario_uf}
                </td>
                <td className="px-4 py-3 text-zinc-500 hidden lg:table-cell">
                  {formatDateTime(s.created_at)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleDemoMode(s.id, s.demo_mode)}
                    className="inline-flex"
                  >
                    {s.demo_mode ? (
                      <ToggleRight size={22} className="text-amber-400" />
                    ) : (
                      <ToggleLeft size={22} className="text-zinc-600" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/${s.id}`}
                      className="p-1.5 text-zinc-400 hover:text-amber-400 transition-colors"
                      title="Gerenciar"
                    >
                      <Package size={16} />
                    </Link>
                    <Link
                      href={`/rastreio/${s.codigo}`}
                      className="p-1.5 text-zinc-400 hover:text-emerald-400 transition-colors"
                      title="Ver rastreio"
                      target="_blank"
                    >
                      <Eye size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {shipments.length === 0 && !loading && (
          <div className="text-center py-12 text-zinc-500">
            Nenhuma encomenda cadastrada.
          </div>
        )}
      </div>

      <Link
        href="/"
        className="block text-center text-sm text-zinc-500 mt-6 hover:text-zinc-300 transition-colors"
      >
        Voltar ao site
      </Link>
    </main>
  );
}
