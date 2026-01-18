# FinanceX (main2)

Monorepo com `apps/api` (Fastify) e `apps/web` (Next.js), além de `packages/shared` com tipos e validações comuns.

## Pré-requisitos
- Node.js LTS
- PostgreSQL 15
- Redis 7

## Variáveis de ambiente
Crie `.env` com base em `.env.example` (a ser incluído). Valores críticos:
- `DATABASE_URL`
- `JWT_SECRET`
- `API_PORT`

## Comandos
```bash
npm install

npm run dev:api
npm run dev:web
```

## Estrutura
```
apps/api        # Fastify + Prisma
apps/web        # Next.js App Router
packages/shared # Tipos e validações
```

## Observabilidade
O backend expõe logs JSON e Swagger em `/docs`.
