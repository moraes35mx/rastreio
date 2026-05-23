import type { Status } from './status';

interface NarrativeContext {
  origemCidade: string;
  origemUf: string;
  destinoCidade: string;
  destinoUf: string;
  localCidade?: string;
  localUf?: string;
}

const narratives: Record<Status, (ctx: NarrativeContext) => string> = {
  postado: (ctx) =>
    `Objeto postado na agência — ${ctx.origemCidade}/${ctx.origemUf}`,
  coletado: (ctx) =>
    `Objeto coletado na unidade de origem — ${ctx.origemCidade}/${ctx.origemUf}`,
  em_transito: (ctx) =>
    `Objeto em trânsito — de ${ctx.origemCidade}/${ctx.origemUf} para ${ctx.destinoCidade}/${ctx.destinoUf}`,
  em_centro_distribuicao: (ctx) =>
    `Objeto recebido no centro de distribuição — ${ctx.destinoCidade}/${ctx.destinoUf}`,
  em_rota_entrega: (ctx) =>
    `Objeto saiu para entrega ao destinatário — ${ctx.destinoCidade}/${ctx.destinoUf}`,
  entregue: (ctx) =>
    `Objeto entregue ao destinatário — ${ctx.destinoCidade}/${ctx.destinoUf}`,
  tentativa_falha: (ctx) =>
    `Tentativa de entrega não realizada — destinatário ausente — ${ctx.localCidade || ctx.destinoCidade}/${ctx.localUf || ctx.destinoUf}`,
  extraviado: () =>
    'Objeto extraviado — em processo de localização',
  aguardando_retirada: (ctx) =>
    `Objeto aguardando retirada na unidade — ${ctx.localCidade || ctx.destinoCidade}/${ctx.localUf || ctx.destinoUf}`,
};

export function generateNarrative(status: Status, ctx: NarrativeContext): string {
  return narratives[status](ctx);
}

export function getEventLocal(
  status: Status,
  origemCidade: string,
  origemUf: string,
  destinoCidade: string,
  destinoUf: string,
): { cidade: string; uf: string } {
  // First statuses happen at origin, later ones at destination
  const atOrigin: Status[] = ['postado', 'coletado', 'em_transito'];
  if (atOrigin.includes(status)) {
    return { cidade: origemCidade, uf: origemUf };
  }
  return { cidade: destinoCidade, uf: destinoUf };
}
