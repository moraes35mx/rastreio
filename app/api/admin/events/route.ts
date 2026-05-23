import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAuthenticated } from '@/lib/auth';
import { isValidStatus } from '@/lib/status';

function getSupabase() {
  return createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim(),
  );
}

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

    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('admin_add_event', {
      admin_token: (process.env.ADMIN_PASSWORD || '').trim(),
      p_shipment_id: shipment_id,
      p_status: status,
      p_descricao: descricao,
      p_local_cidade: local_cidade || '',
      p_local_uf: local_uf || '',
      p_ocorrido_em: ocorrido_em,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
