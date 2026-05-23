import { BRAND } from '@/lib/brand';
import { TrackingForm } from '@/components/TrackingForm';
import { Package, Shield, Clock, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
            <Package size={16} />
            <span>Rastreamento em tempo real</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            <span className="text-zinc-100">Rastreie sua</span>
            <br />
            <span className="text-amber-400">encomenda</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Acompanhe o status da sua entrega em tempo real.
            <br className="hidden sm:block" />
            Insira o código de rastreio abaixo para começar.
          </p>
        </div>

        <TrackingForm />

        {/* Trust badges */}
        <div className="relative z-10 mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[
            { icon: Clock, label: 'Atualização em tempo real', desc: 'Status atualizado a cada movimentação' },
            { icon: MapPin, label: 'Rastreio completo', desc: 'Acompanhe da coleta à entrega' },
            { icon: Shield, label: 'Seguro e confiável', desc: 'Seus dados protegidos' },
          ].map((item, idx) => (
            <div key={idx} className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-700/50">
                <item.icon size={18} className="text-amber-500" />
              </div>
              <p className="text-sm font-medium text-zinc-300">{item.label}</p>
              <p className="text-xs text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-zinc-600 border-t border-zinc-800/50">
        {BRAND.name} &copy; {new Date().getFullYear()} — Todos os direitos reservados
      </footer>
    </main>
  );
}
