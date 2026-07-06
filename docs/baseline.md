# Baseline do Estudo (TCC)

Este documento registra o estado inicial ("baseline") preparado para o estudo do TCC.

## Itens Removidos e o que Demonstravam

- **Domínio Post (`/posts`, schema, router tRPC, repository, feature e modelo Prisma):** Demonstrava um fluxo CRUD completo ponta a ponta com tRPC, Prisma ORM, validação com Zod, paginação, busca textual e controle de acesso baseado em propriedade do registro e permissão de administrador.
- **Página de Exemplos (`/example` e feature `example`):** Demonstrava o catálogo e uso prático de componentes de interface (autocomplete, datepicker, modais, switch, tabela ordenável com TanStack Table) e fluxos de upload de arquivos (simples e múltiplo) integrados a storage.
- **Página de Estado na URL (`/url-state-example` e feature `home`):** Demonstrava a sincronização bidirecional e reativa de estado de formulário/input diretamente na URL via query parameters utilizando a biblioteca `nuqs` (`useQueryState`).
