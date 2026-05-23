'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Plus,
  LogOut,
  LogIn,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { BRAND } from '@/lib/brand';

interface AdminContextType {
  authenticated: boolean;
  setAuthenticated: (v: boolean) => void;
}

const AdminContext = createContext<AdminContextType>({
  authenticated: false,
  setAuthenticated: () => {},
});

export function useAdmin() {
  return useContext(AdminContext);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/shipments');
      setAuthenticated(res.status !== 401);
    } catch {
      setAuthenticated(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (checking) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <AdminContext.Provider value={{ authenticated, setAuthenticated }}>
        <LoginScreen onSuccess={() => setAuthenticated(true)} />
      </AdminContext.Provider>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Encomendas', icon: Package, exact: true },
  ];

  return (
    <AdminContext.Provider value={{ authenticated, setAuthenticated }}>
      <div className="flex-1 flex min-h-screen">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-zinc-950 border-r border-zinc-800/60">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-zinc-800/60">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Package size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">{BRAND.name}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Painel</p>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-amber-500/10 text-amber-400 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/admin?new=1"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
            >
              <Plus size={18} />
              Nova encomenda
            </Link>
          </nav>

          {/* Footer */}
          <div className="px-3 py-4 border-t border-zinc-800/60 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
            >
              <LayoutDashboard size={14} />
              Ver site público
              <ChevronRight size={12} className="ml-auto" />
            </Link>
            <button
              onClick={() => {
                document.cookie = 'admin_session=; Max-Age=0; path=/';
                setAuthenticated(false);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-red-400 hover:bg-zinc-800/50 transition-colors w-full"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/60">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Package size={14} className="text-amber-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-100">{BRAND.name}</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-zinc-400"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-40 bg-black/60"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800/60 pt-16"
              >
                <nav className="px-3 py-4 space-y-1">
                  {navItems.map((item) => {
                    const active = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          active
                            ? 'bg-amber-500/10 text-amber-400 font-medium'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                        }`}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </Link>
                    );
                  })}
                  <Link
                    href="/admin?new=1"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
                  >
                    <Plus size={18} />
                    Nova encomenda
                  </Link>
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 bg-[#0a0a0a] lg:bg-zinc-950/30 overflow-auto pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </AdminContext.Provider>
  );
}

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
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
      onSuccess();
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 min-h-screen bg-[#0a0a0a]">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
            <Package size={24} className="text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100">{BRAND.name}</h1>
          <p className="text-sm text-zinc-500 mt-1">Acesso ao painel de gestão</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha de acesso"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              autoFocus
            />
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm"
            >
              {error}
            </motion.p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 text-black font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                Entrar
              </>
            )}
          </button>
        </form>

        <Link
          href="/"
          className="block text-center text-xs text-zinc-600 mt-6 hover:text-zinc-400 transition-colors"
        >
          Voltar ao site
        </Link>
      </motion.div>
    </div>
  );
}
