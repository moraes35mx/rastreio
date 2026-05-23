import { BRAND } from '@/lib/brand';
import { TrackingForm } from '@/components/TrackingForm';
import { DemoCodes } from '@/components/DemoCodes';
import { Package } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-6 mb-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            <Package size={18} />
            <span>Sistema de Rastreamento</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            <span className="text-amber-400">{BRAND.name}</span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-md mx-auto">
            {BRAND.tagline}
          </p>
        </div>

        <TrackingForm />
        <DemoCodes />
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-zinc-600 border-t border-zinc-800/50">
        {BRAND.name} &copy; {new Date().getFullYear()} — Todos os direitos reservados
      </footer>
    </main>
  );
}
