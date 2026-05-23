import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isAuthenticated } from '@/lib/auth';
import { generateTrackingCode } from '@/lib/format';
import { generateNarrative } from '@/lib/narratives';

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('shipments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      servico,
      remetente_nome,
      remetente_cidade,
      remetente_uf,
      destinatario_nome,
      destinatario_cidade,
      destinatario_uf,
      peso_kg,
      previsao_entrega,
      demo_mode,
    } = body as {
      servico: string;
      remetente_nome: string;
      remetente_cidade: string;
      remetente_uf: string;
      destinatario_nome: string;
      destinatario_cidade: string;
      destinatario_uf: string;
      peso_kg: number;
      previsao_entrega: string | null;
      demo_mode: boolean;
    };

    const codigo = generateTrackingCode();

    // Create shipment
    const { data: shipment, error: shipmentError } = await supabaseAdmin
      .from('shipments')
      .insert({
        codigo,
        servico: servico || 'Expresso',
        remetente_nome,
        remetente_cidade,
        remetente_uf,
        destinatario_nome,
        destinatario_cidade,
        destinatario_uf,
        peso_kg: peso_kg || 0.5,
        status_atual: 'postado',
        previsao_entrega: previsao_entrega || null,
        demo_mode: demo_mode || false,
      })
      .select()
      .single();

    if (shipmentError || !shipment) {
      return NextResponse.json({ error: shipmentError?.message || 'Erro ao criar' }, { status: 500 });
    }

    // Create first event
    const descricao = generateNarrative('postado', {
      origemCidade: remetente_cidade,
      origemUf: remetente_uf,
      destinoCidade: destinatario_cidade,
      destinoUf: destinatario_uf,
    });

    await supabaseAdmin.from('tracking_events').insert({
      shipment_id: shipment.id,
      status: 'postado',
      descricao,
      local_cidade: remetente_cidade,
      local_uf: remetente_uf,
      ocorrido_em: new Date().toISOString(),
    });

    return NextResponse.json(shipment, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
