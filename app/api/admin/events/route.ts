import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isAuthenticated } from '@/lib/auth';
import { isValidStatus } from '@/lib/status';

export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { shipment_id, status, descricao, local_cidade, local_uf, ocorrido_em } = body as {
      shipment_id: string;
      status: string;
      descricao: string;
      local_cidade: string;
      local_uf: string;
      ocorrido_em: string;
    };

    if (!shipment_id || !status || !descricao || !ocorrido_em) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    if (!isValidStatus(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.from('tracking_events').insert({
      shipment_id,
      status,
      descricao,
      local_cidade: local_cidade || null,
      local_uf: local_uf || null,
      ocorrido_em,
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update shipment status
    await supabaseAdmin
      .from('shipments')
      .update({ status_atual: status })
      .eq('id', shipment_id);

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
