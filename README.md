# Brand Connect — Relatórios de Social Media

App interno para a equipe da Brand Connect: login, upload de exports do Meta
Business Suite (por enquanto só Instagram) por cliente, e visualização das
métricas gravadas no banco.

Stack: **Next.js 16 (App Router) + TypeScript + Tailwind** no [Vercel](https://vercel.com),
banco/autenticação no [Supabase](https://supabase.com) — ambos com free tier
suficiente para o estágio atual.

## Requisitos

- Node **22** (o projeto tem um `.nvmrc` — rode `nvm use` na pasta do projeto).
  As libs do Supabase exigem Node ≥ 22.

## 1. Criar o projeto no Supabase

1. Crie uma conta em [supabase.com](https://supabase.com) e um novo projeto (free tier).
2. Em **SQL Editor**, rode o conteúdo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   — isso cria as tabelas (`clients`, `social_accounts`, `report_uploads`, `posts`) e as
   políticas de RLS (qualquer usuário autenticado tem acesso total — não há login de cliente
   final nesta fase).
3. Em **Authentication → Users**, crie manualmente os usuários da equipe (email + senha).
   Não há tela de "criar conta" no app — os logins são criados direto no painel do Supabase.
4. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.

## 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com os valores do passo anterior:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxx
```

## 3. Rodar localmente

```bash
nvm use
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — vai redirecionar para `/login`.

## 4. Fluxo de uso

1. Login com um usuário criado no Supabase Auth.
2. `/dashboard` → criar um cliente (ex: "Piello").
3. Abrir o cliente → fazer upload do CSV exportado do Meta Business Suite (Instagram).
   O período do relatório é extraído automaticamente do nome do arquivo (ex:
   `Jul-01-2026_Jul-22-2026_<id>.csv`), mas pode ser ajustado manualmente.
4. A conta do Instagram é criada automaticamente a partir dos dados do próprio arquivo.
   Reenviar o mesmo arquivo (ou um período sobreposto) atualiza os posts existentes em vez
   de duplicar.
5. Clicar na conta social para ver os totais do período e a tabela de posts.

## Deploy (Vercel)

1. Suba este repositório no GitHub.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. Configure as mesmas variáveis de ambiente do passo 2 (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) nas configurações do projeto na Vercel.
4. Deploy. Free tier da Vercel + free tier do Supabase cobrem o uso inicial.

## Notas técnicas

- O parser (`lib/csv/parseInstagramExport.ts`) corrige automaticamente arquivos com
  acentuação corrompida (mojibake) que alguns exports trazem, além de remover o BOM.
- Suporte a Facebook ainda não foi implementado — o schema (`social_accounts.platform`)
  já está preparado para isso, falta o parser específico do formato de export do Facebook.
- Todo usuário autenticado tem acesso a todos os clientes (é uma ferramenta interna da
  agência, sem login para os clientes finais).