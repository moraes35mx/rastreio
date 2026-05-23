import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import type { Shipment, TrackingEvent } from '@/lib/types';
import { TrackingDetail } from './TrackingDetail';

// Server-side Supabase client (uses anon key for public read)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function generateMetadata({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  return {
    title: `Rastreio ${codigo} — ${BRAND.name}`,
    description: `Acompanhe o status da encomenda ${codigo}`,
  };
}

export const dynamic = 'force-dynamic';

export default async function RastreioPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const supabase = getSupabase();

  const { data: shipment, error: shipmentError } = await supabase
    .from('shipments')
    .select('*')
    .eq('codigo', codigo.toUpperCase())
    .single<Shipment>();

  if (shipmentError || !shipment) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-zinc-800 flex items-center justify-center">
            <span className="text-3xl">📦</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Código não encontrado</h1>
          <p className="text-zinc-400">
            O código <code className="px-2 py-0.5 bg-zinc-800 rounded text-amber-400">{codigo}</code> não
            foi encontrado no sistema. Verifique se digitou corretamente.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft size={18} />
            Voltar ao início
          </Link>
        </div>
      </main>
    );
  }

  const { data: events } = await supabase
    .from('tracking_events')
    .select('*')
    .eq('shipment_id', shipment.id)
    .order('ocorrido_em', { ascending: false })
    .returns<TrackingEvent[]>();

  return <TrackingDetail shipment={shipment} events={events || []} />;
}
