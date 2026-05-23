import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isAuthenticated } from '@/lib/auth';
import { nextStatus, isValidStatus } from '@/lib/status';
import { generateNarrative, getEventLocal } from '@/lib/narratives';
import type { Shipment } from '@/lib/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;

  const { data: shipment, error } = await supabaseAdmin
    .from('shipments')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !shipment) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  }

  const { data: events } = await supabaseAdmin
    .from('tracking_events')
    .select('*')
    .eq('shipment_id', id)
    .order('ocorrido_em', { ascending: false });

  return NextResponse.json({ ...shipment, tracking_events: events || [] });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { action, status: exceptionStatus, demo_mode } = body as {
      action?: 'advance' | 'exception';
      status?: string;
      demo_mode?: boolean;
    };

    // Toggle demo_mode
    if (typeof demo_mode === 'boolean') {
      const { error } = await supabaseAdmin
        .from('shipments')
        .update({ demo_mode })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    // Get current shipment
    const { data: shipment, error: fetchError } = await supabaseAdmin
      .from('shipments')
      .select('*')
      .eq('id', id)
      .single<Shipment>();

    if (fetchError || !shipment) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    }

    if (action === 'advance') {
      const next = nextStatus(shipment.status_atual);
      if (!next) {
        return NextResponse.json({ error: 'Já no status final' }, { status: 400 });
      }

      const local = getEventLocal(
        next,
        shipment.remetente_cidade,
        shipment.remetente_uf,
        shipment.destinatario_cidade,
        shipment.destinatario_uf,
      );

      const descricao = generateNarrative(next, {
        origemCidade: shipment.remetente_cidade,
        origemUf: shipment.remetente_uf,
        destinoCidade: shipment.destinatario_cidade,
        destinoUf: shipment.destinatario_uf,
        localCidade: local.cidade,
        localUf: local.uf,
      });

      // Update shipment status
      await supabaseAdmin
        .from('shipments')
        .update({ status_atual: next })
        .eq('id', id);

      // Create event
      await supabaseAdmin.from('tracking_events').insert({
        shipment_id: id,
        status: next,
        descricao,
        local_cidade: local.cidade,
        local_uf: local.uf,
        ocorrido_em: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, new_status: next });
    }

    if (action === 'exception' && exceptionStatus && isValidStatus(exceptionStatus)) {
      const local = getEventLocal(
        exceptionStatus,
        shipment.remetente_cidade,
        shipment.remetente_uf,
        shipment.destinatario_cidade,
        shipment.destinatario_uf,
      );

      const descricao = generateNarrative(exceptionStatus, {
        origemCidade: shipment.remetente_cidade,
        origemUf: shipment.remetente_uf,
        destinoCidade: shipment.destinatario_cidade,
        destinoUf: shipment.destinatario_uf,
        localCidade: local.cidade,
        localUf: local.uf,
      });

      await supabaseAdmin
        .from('shipments')
        .update({ status_atual: exceptionStatus })
        .eq('id', id);

      await supabaseAdmin.from('tracking_events').insert({
        shipment_id: id,
        status: exceptionStatus,
        descricao,
        local_cidade: local.cidade,
        local_uf: local.uf,
        ocorrido_em: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, new_status: exceptionStatus });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
