---
trigger: always_on
---

# Senior Code Style

Este documento define como escrever código com padrão “sênior”: legível, previsível, fácil de testar e fácil de manter.  
Regra de ouro: **clareza > esperteza**.

---

## 1) Princípios que mandam em tudo

- **Código é pra ser lido** (muito mais do que escrito).
- **Mudança barata**: prefira designs fáceis de adaptar.
- **Complexidade é dívida**: só aceite se pagar valor real.
- **Consistência vence opinião**: escolha um estilo e padronize (ESLint/Prettier).

---

## 2) Anti-overengineering (obrigatório)

Overengineering é quando você:
- cria abstrações “porque um dia pode precisar”,
- cria interfaces sem variação real,
- cria camadas extras sem reduzir complexidade,
- cria generics/factories/padrões complexos para um problema simples.

Regras práticas:
- **Não abstraia antes da duplicação real** (ou variação real).
- **Não crie extensão/plug-in system** se o produto nem provou essa necessidade.
- **Prefira duplicar 2x** do que criar uma abstração ruim e prematura.
- “Solução simples agora” > “arquitetura perfeita para um futuro hipotético”.

---

## 3) Tamanho e coesão: quando quebrar arquivo/função/componente

### Funções
- Ideal: **até ~20–30 linhas**, 1 responsabilidade.
- Se a função tem muitos `if/else`, use **guard clauses / early return**.
- Se você precisa comentar “o que está acontecendo”, provavelmente precisa **extrair função**. :contentReference[oaicite:1]{index=1}

### Arquivos
- Se passar de **~300 linhas**, reavalie:
  - separar por responsabilidade,
  - extrair helpers,
  - extrair subcomponentes,
  - mover tipos para `types.ts` (ou equivalente).

### Componentes React
- Se o componente virou “página inteira”, quebre:
  - **Container** (lógica) + **Presentational** (UI),
  - subcomponentes de seções repetíveis,
  - hooks para lógica complexa.

---

## 4) “Props demais”: o que fazer

Sinais:
- mais de **5–7 props**,
- props “encadeadas” (`a`, `b`, `c`, `d`) que sempre andam juntas,
- muito repasse (prop drilling).

Ações recomendadas (na ordem):
1) **Agrupar props relacionadas** em objetos (ex: `user`, `permissions`, `handlers`).
2) **Extrair subcomponentes** (cada um recebe menos props).
3) **State/logic colocation**: manter estado mais perto de quem usa (evita prop drilling). :contentReference[oaicite:2]{index=2}
4) **Context** só quando for realmente “estado compartilhado” por várias camadas.

Evite:
- “Mega componente” que renderiza tudo,
- passar callbacks e dados por 5 níveis.

---

## 5) Nomes e intenção

- Nomes devem responder: **o que é** e **pra que serve**.
- Prefira nomes booleanos com `is/has/can/should`.
- Evite “caixa genérica”: `data`, `value`, `obj`, `temp`.

Tipos TS:
- Não use `String/Number/Boolean/Object` (use `string/number/boolean/object`). :contentReference[oaicite:3]{index=3}

---

## 6) TypeScript com padrão “adulto”

- **Evite `any`**. Se inevitável, isole e explique.
- Tipos primeiro: deixe o contrato claro antes da implementação.
- Não exporte coisa sem necessidade (reduz acoplamento). :contentReference[oaicite:4]{index=4}
- Prefira união discriminada pra fluxo (`type State = { kind: "loading" } | ...`).

---

## 7) React: regras e legibilidade

Regras obrigatórias:
- **Hooks só no topo** (não dentro de `if`, loops, try/catch). :contentReference[oaicite:5]{index=5}

Legibilidade de JSX:
- Evite ternários aninhados.
- Se tiver muita condição:
  - extraia para variáveis (`const showX = ...`),
  - extraia para função (`renderHeader()`),
  - ou subcomponentes.

Effects:
- `useEffect` deve ter **uma responsabilidade**.
- Se ficou grande, extraia para hook.

---

## 8) Next.js App Router: práticas atuais

- Prefira **Server Components** por padrão e use Client Components só quando precisar de interatividade/browser APIs.
- Data fetching: siga os padrões recomendados no App Router. :contentReference[oaicite:6]{index=6}

---

## 9) Erros e validações (código previsível)

- “Falhe cedo”: valide input no começo (guard clauses).
- Erros devem ter intenção: mensagens úteis e padronizadas.
- Nunca engula erro silenciosamente.

---

## 10) Organização e colocation (menos caça ao arquivo)

- Co-locar código relacionado (UI + testes + estilos + helpers próximos) melhora manutenção. :contentReference[oaicite:7]{index=7}
- Pastas por “tipo” (`components/ utils/ services/`) tendem a piorar em projetos grandes; prefira por domínio/feature quando fizer sentido.

---

## 11) Config/ambientes e boas práticas de entrega

- Config via ambiente, build e deploy previsíveis, dev/prod próximos (mentalidade 12-factor). :contentReference[oaicite:8]{index=8}
- Evite valores mágicos espalhados: crie constantes com nome.

---

## 12) Checklist sênior antes de “entregar o PR”

- Está **simples**?
- Dá pra entender em **30 segundos**?
- Há duplicação óbvia que merece extração?
- O componente está com props demais? (quebrar/colocar state mais perto?)
- Tem `any` evitável?
- Hooks respeitam as regras?
- O arquivo está grande por múltiplas responsabilidades?
- Existe alguma abstração “porque sim”? (remover)

---

## Regra final

> Código sênior não é o mais avançado — é o **mais fácil de manter**.