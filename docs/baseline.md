# Baseline do Estudo (TCC)

Este documento registra o estado inicial ("baseline") preparado para o estudo do TCC.

## Itens Removidos e o que Demonstravam

- **Domínio Post (`/posts`, schema, router tRPC, repository, feature e modelo Prisma):** Demonstrava um fluxo CRUD completo ponta a ponta com tRPC, Prisma ORM, validação com Zod, paginação, busca textual e controle de acesso baseado em propriedade do registro e permissão de administrador.
- **Página de Exemplos (`/example` e feature `example`):** Demonstrava o catálogo e uso prático de componentes de interface (autocomplete, datepicker, modais, switch, tabela ordenável com TanStack Table) e fluxos de upload de arquivos (simples e múltiplo) integrados a storage.
- **Página de Estado na URL (`/url-state-example` e feature `home`):** Demonstrava a sincronização bidirecional e reativa de estado de formulário/input diretamente na URL via query parameters utilizando a biblioteca `nuqs` (`useQueryState`).

## Diagnóstico do Linter (Biome)

- **Total de erros encontrados:** 92 erros (em 101 arquivos analisados)
- **Status:** Mantidos sem correção conforme instrução para manter a integridade da baseline.

## Versões das Ferramentas

| Ferramenta | Versão |
| --- | --- |
| Node.js | v22.23.3 |
| pnpm | 10.6.5 |
| Next.js | 15.3.8 |
| React | 19.1.0 |
| TypeScript | 5.8.3 |
| Prisma | 6.7.0 |
| Biome | 2.2.2 |
| PostgreSQL (Docker) | 17 |

## Usuários de Teste do Seed

- **Administrador:**
  - Email: `admin@sambytelabs.com.br`
  - Perfil / Role: `ADMIN`
  - Método de login: Magic Link
- **Usuário de Teste 1:**
  - Email: `teste1@example.com`
  - Senha: `Teste@123`
  - Perfil / Role: `MEMBER`
- **Usuário de Teste 2:**
  - Email: `teste2@example.com`
  - Senha: `Teste@123`
  - Perfil / Role: `MEMBER`

## Extensões de IA Detectadas no .vscode

Identificadas em `.vscode/extensions.json` e `.vscode/settings.json` (mantidas sem alteração):
- `github.copilot` (GitHub Copilot)
- `github.copilot-chat` (GitHub Copilot Chat, com configurações de `chat.agent.maxRequests`, `chat.tools.terminal.autoApprove` e `chat.todoListTool.enabled`)
