# TranspoBR — Sistema de Rastreio de Encomendas

Sistema de rastreamento de encomendas com simulação completa, painel admin e deploy compartilhado.

## Stack

- **Next.js 15** (App Router, Server Components)
- **TypeScript** (strict)
- **Tailwind CSS** + **Framer Motion**
- **Supabase** (PostgreSQL + RLS)
- **lucide-react** para ícones
- Deploy na **Vercel**

---

## Setup Supabase

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Anote a **Project URL** e as **API Keys** (anon e service_role)

### 2. Executar Migration

No **SQL Editor** do Supabase, cole e execute o conteúdo de:

```
supabase/migrations/0001_init.sql
```

Isso cria as tabelas `shipments` e `tracking_events` com RLS configurado.

### 3. Executar Seed

No **SQL Editor**, cole e execute o conteúdo de:

```
supabase/seed.sql
```

Isso cria 5 encomendas de demonstração com estados variados.

---

## Setup Local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
ADMIN_PASSWORD=sua-senha-admin
```

### 3. Rodar

```bash
npm run dev
```

Acesse `http://localhost:3000`

---

## Deploy na Vercel

### 1. Subir para GitHub

```bash
git init
git add .
git commit -m "feat: sistema de rastreio completo"
git remote add origin https://github.com/SEU-USER/rastreio.git
git push -u origin main
```

### 2. Importar na Vercel

1. Vá em [vercel.com/new](https://vercel.com/new)
2. Importe o repositório
3. Configure as **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
4. Deploy

### 3. Agendar Demo Tick (opcional)

Para que encomendas com `demo_mode` avancem automaticamente, configure um cron.

**Opção A — Vercel Cron:**

Crie `vercel.json` na raiz:

```json
{
  "crons": [
    {
      "path": "/api/demo/tick",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

> Avança encomendas demo a cada 5 minutos.

**Opção B — Cron externo (cron-job.org, Uptime Robot, etc.):**

Configure para fazer POST em:
```
https://SEU-DOMINIO.vercel.app/api/demo/tick
```

---

## Códigos de Demonstração

| Código | Status | Rota |
|--------|--------|------|
| `TR482917365BR` | Entregue | SP -> RJ |
| `TR739150284BR` | Em Rota de Entrega | PR -> SC |
| `TR615823947BR` | Em Transito (demo) | MG -> BA |
| `TR204867531BR` | Tentativa Falha | PE -> CE |
| `TR378491026BR` | Postado (demo) | RS -> DF |

Os codigos com `(demo)` tem `demo_mode` ativado e avancam com o tick.

---

## Rotas

| Rota | Descricao |
|------|-----------|
| `/` | Home + busca de rastreio |
| `/rastreio/[codigo]` | Detalhe do rastreio (URL compartilhavel) |
| `/admin` | Painel administrativo (login com senha) |
| `/admin/[id]` | Detalhe admin de uma encomenda |
| `/api/demo/tick` | POST — avanca encomendas demo em 1 etapa |

---

## Personalizacao

Edite `lib/brand.ts` para trocar nome, tagline e cor da marca:

```ts
export const BRAND = {
  name: 'SuaMarca',
  tagline: 'Seu slogan aqui.',
  accentColor: '#D97706',
  // ...
};
```
