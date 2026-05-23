import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { nextStatus, STATUS_FLOW } from '@/lib/status';
import { generateNarrative, getEventLocal } from '@/lib/narratives';
import type { Shipment } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Get all demo_mode shipments that aren't delivered yet
    const { data: shipments, error } = await supabaseAdmin
      .from('shipments')
      .select('*')
      .eq('demo_mode', true)
      .not('status_atual', 'eq', 'entregue')
      .returns<Shipment[]>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!shipments || shipments.length === 0) {
      return NextResponse.json({ message: 'Nenhuma encomenda demo para avançar', advanced: 0 });
    }

    let advanced = 0;

    for (const shipment of shipments) {
      // If status is an exception, move back to the flow
      const isInFlow = (STATUS_FLOW as readonly string[]).includes(shipment.status_atual);
      let next: string | null;

      if (!isInFlow) {
        // Exception: move to em_rota_entrega (retry delivery)
        next = 'em_rota_entrega';
      } else {
        next = nextStatus(shipment.status_atual);
      }

      if (!next) continue;

      const local = getEventLocal(
        next as Shipment['status_atual'],
        shipment.remetente_cidade,
        shipment.remetente_uf,
        shipment.destinatario_cidade,
        shipment.destinatario_uf,
      );

      const descricao = generateNarrative(next as Shipment['status_atual'], {
        origemCidade: shipment.remetente_cidade,
        origemUf: shipment.remetente_uf,
        destinoCidade: shipment.destinatario_cidade,
        destinoUf: shipment.destinatario_uf,
        localCidade: local.cidade,
        localUf: local.uf,
      });

      await supabaseAdmin
        .from('shipments')
        .update({ status_atual: next })
        .eq('id', shipment.id);

      await supabaseAdmin.from('tracking_events').insert({
        shipment_id: shipment.id,
        status: next,
        descricao,
        local_cidade: local.cidade,
        local_uf: local.uf,
        ocorrido_em: new Date().toISOString(),
      });

      advanced++;
    }

    return NextResponse.json({
      message: `${advanced} encomenda(s) avançada(s)`,
      advanced,
    });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
