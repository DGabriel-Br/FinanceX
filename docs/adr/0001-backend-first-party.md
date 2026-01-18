# ADR 0001: Backend first-party e saída de Supabase

## Contexto
O FinanceX dependia de Supabase e políticas públicas. Para controle de segurança e LGPD, adotamos backend próprio com Fastify e PostgreSQL.

## Decisão
- Monorepo com `apps/api`, `apps/web` e `packages/shared`.
- Autenticação JWT e autorização por usuário.
- PostgreSQL como fonte de verdade e Redis para cache.

## Consequências
- Rotas e payloads passam a ser servidos pela API própria.
- Precisamos manter migrações e seeds versionadas.
