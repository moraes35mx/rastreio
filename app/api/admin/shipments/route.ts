import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAuthenticated } from '@/lib/auth';
import { generateTrackingCode } from '@/lib/format';
import { generateNarrative } from '@/lib/narratives';

function getSupabase() {
  return createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim(),
  );
}

function getAdminToken() {
  return (process.env.ADMIN_PASSWORD || '').trim();
}

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('admin_list_shipments', {
    admin_token: getAdminToken(),
  });

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
    const descricao = generateNarrative('postado', {
      origemCidade: remetente_cidade,
      origemUf: remetente_uf,
      destinoCidade: destinatario_cidade,
      destinoUf: destinatario_uf,
    });

    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('admin_create_shipment', {
      admin_token: getAdminToken(),
      p_codigo: codigo,
      p_servico: servico || 'Expresso',
      p_remetente_nome: remetente_nome,
      p_remetente_cidade: remetente_cidade,
      p_remetente_uf: remetente_uf,
      p_destinatario_nome: destinatario_nome,
      p_destinatario_cidade: destinatario_cidade,
      p_destinatario_uf: destinatario_uf,
      p_peso_kg: peso_kg || 0.5,
      p_previsao_entrega: previsao_entrega || null,
      p_demo_mode: demo_mode || false,
      p_first_event_desc: descricao,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
