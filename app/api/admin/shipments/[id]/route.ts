import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAuthenticated } from '@/lib/auth';
import { nextStatus, isValidStatus } from '@/lib/status';
import { generateNarrative, getEventLocal } from '@/lib/narratives';
import type { Shipment } from '@/lib/types';

function getSupabase() {
  return createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim(),
  );
}

function getAdminToken() {
  return (process.env.ADMIN_PASSWORD || '').trim();
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc('admin_get_shipment', {
    admin_token: getAdminToken(),
    shipment_id: id,
  });

  if (error) {
    const status = error.message.includes('not_found') ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json(data);
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
  const supabase = getSupabase();
  const token = getAdminToken();

  try {
    const body = await request.json();
    const { action, status: exceptionStatus, demo_mode } = body as {
      action?: 'advance' | 'exception';
      status?: string;
      demo_mode?: boolean;
    };

    // Toggle demo_mode
    if (typeof demo_mode === 'boolean') {
      const { error } = await supabase.rpc('admin_toggle_demo', {
        admin_token: token,
        p_shipment_id: id,
        p_demo_mode: demo_mode,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    // Need shipment data for advance/exception
    const { data: shipmentData, error: fetchError } = await supabase.rpc('admin_get_shipment', {
      admin_token: token,
      shipment_id: id,
    });

    if (fetchError || !shipmentData) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    }

    const shipment = shipmentData as Shipment;

    if (action === 'advance') {
      const next = nextStatus(shipment.status_atual);
      if (!next) {
        return NextResponse.json({ error: 'Já no status final' }, { status: 400 });
      }

      const local = getEventLocal(next, shipment.remetente_cidade, shipment.remetente_uf, shipment.destinatario_cidade, shipment.destinatario_uf);
      const descricao = generateNarrative(next, {
        origemCidade: shipment.remetente_cidade,
        origemUf: shipment.remetente_uf,
        destinoCidade: shipment.destinatario_cidade,
        destinoUf: shipment.destinatario_uf,
        localCidade: local.cidade,
        localUf: local.uf,
      });

      const { data, error } = await supabase.rpc('admin_advance_shipment', {
        admin_token: token,
        p_shipment_id: id,
        p_new_status: next,
        p_descricao: descricao,
        p_local_cidade: local.cidade,
        p_local_uf: local.uf,
      });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }

    if (action === 'exception' && exceptionStatus && isValidStatus(exceptionStatus)) {
      const local = getEventLocal(exceptionStatus, shipment.remetente_cidade, shipment.remetente_uf, shipment.destinatario_cidade, shipment.destinatario_uf);
      const descricao = generateNarrative(exceptionStatus, {
        origemCidade: shipment.remetente_cidade,
        origemUf: shipment.remetente_uf,
        destinoCidade: shipment.destinatario_cidade,
        destinoUf: shipment.destinatario_uf,
        localCidade: local.cidade,
        localUf: local.uf,
      });

      const { data, error } = await supabase.rpc('admin_advance_shipment', {
        admin_token: token,
        p_shipment_id: id,
        p_new_status: exceptionStatus,
        p_descricao: descricao,
        p_local_cidade: local.cidade,
        p_local_uf: local.uf,
      });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
