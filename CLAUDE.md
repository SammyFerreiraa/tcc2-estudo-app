# Diretrizes do Projeto - Template Full-Stack

## Stack Tecnológica
- **Framework:** Next.js 15 (App Router, Turbopack) & React 19
- **Linguagem & Tipagem:** TypeScript (estrito, usar `type` em vez de `interface`)
- **API & Comunicação:** tRPC v11 & TanStack Query v5
- **Banco de Dados & ORM:** PostgreSQL 17 (Docker) & Prisma ORM 6
- **Estilização:** Tailwind CSS v4 & Radix UI
- **Validação:** Zod
- **Linter & Formatador:** Biome

## Comandos Úteis
- `pnpm dev`: Inicia o servidor de desenvolvimento
- `pnpm typecheck`: Executa a checagem de tipos com TypeScript
- `pnpm lint`: Executa a verificação estática com Biome
- `pnpm db:push`: Aplica alterações do schema do Prisma ao PostgreSQL
- `pnpm db:seed`: Popula o banco com admin e dados iniciais de teste

## Usuários de Teste (Seed)
- **Admin:** `admin@sambytelabs.com.br` (Role: ADMIN, login via magic link)
- **Teste 1:** `teste1@example.com` | Senha: `Teste@123` (Role: MEMBER)
- **Teste 2:** `teste2@example.com` | Senha: `Teste@123` (Role: MEMBER)

## Regras e Padrões de Desenvolvimento
- Consulte e siga rigorosamente as regras em `.agent/rules/`.
- Utilize as skills disponíveis em `.agent/skills/`.
- Mantenha arquitetura *feature-first* em `src/interface/features/`.
- Configure rotas protegidas em `src/config/route-control.ts` antes de criar páginas.
- Valide permissões no servidor e no cliente.
