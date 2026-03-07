---
trigger: always_on
---

# 🤖 AI CLEAN CODE RULES — ADVANCED

Este documento define regras obrigatórias de qualidade e maturidade de código.

A IA deve gerar código como um desenvolvedor experiente, priorizando:

- Clareza
- Simplicidade
- Baixa complexidade cognitiva
- Evolução sustentável
- Zero overengineering

Se houver dúvida entre solução "inteligente" e solução "simples", escolher sempre a simples.

---

# 1️⃣ LIMITE DE COMPLEXIDADE

## 1.1 Complexidade Cognitiva

A IA deve evitar:

- Mais de 3 níveis de indentação
- Mais de 3 condicionais aninhadas
- Ternários encadeados
- Switch gigante

Se ultrapassar isso:
→ Refatorar imediatamente.

---

## 1.2 Tamanho Máximo Recomendado

- Função: ideal até 20 linhas
- Componente React: ideal até 150–200 linhas
- Arquivo: ideal até 300 linhas

Se ultrapassar:
→ Dividir responsabilidade.

---

# 2️⃣ REFATORAÇÃO AUTOMÁTICA

A IA deve refatorar automaticamente quando detectar:

- Código duplicado
- Função fazendo mais de uma coisa
- Lógica complexa no JSX
- Props excessivas
- useEffect com múltiplas responsabilidades

Refatorações esperadas:

- Extrair função
- Criar subcomponente
- Criar hook customizado
- Criar util/helper
- Aplicar early return

---

# 3️⃣ PROPS EXCESSIVAS

Se um componente tiver mais de 5–6 props:

A IA deve avaliar:

1. Agrupar props relacionadas em objeto
2. Criar subcomponentes
3. Criar contexto
4. Extrair lógica para hook

Nunca manter componente com "prop explosion".

---

# 4️⃣ RESPONSABILIDADE ÚNICA (SRP)

Cada unidade deve ter apenas UMA razão para mudar:

- Função → uma ação clara
- Hook → um comportamento isolado
- Componente → uma responsabilidade visual
- Arquivo → um propósito principal

Se fizer múltiplas coisas:
→ Dividir.

---

# 5️⃣ OVERENGINEERING (PROIBIDO)

Overengineering é:

- Criar abstrações antes da necessidade
- Criar interfaces sem múltiplas implementações reais
- Criar factories desnecessárias
- Criar generic excessivo
- Criar camadas extras "porque pode"
- Criar sistema de plugin para algo simples
- Criar micro-otimização prematura

A IA deve evitar:

❌ Padrões complexos para resolver problema simples  
❌ Arquitetura futura hipotética  
❌ Código preparado para escala inexistente  

Regra:

> Resolver o problema atual da forma mais simples possível, sem comprometer legibilidade.

---

# 6️⃣ ABSTRAÇÃO NA MEDIDA CERTA

Criar abstração apenas quando:

- Existe duplicação real
- Existe variação real
- Existe regra compartilhada
- Existe complexidade repetida

Não criar abstração "por estética".

---

# 7️⃣ ESTADO

Evitar:

- Estado duplicado
- Estado derivável
- Sincronização manual desnecessária

Preferir:

const isValid = email.length > 3

Evitar:

const [isValid, setIsValid] = useState(false)

---

# 8️⃣ EARLY RETURN OBRIGATÓRIO

Sempre preferir guard clauses:

if (!user) return null

Evitar:

if (user) {
   ...
}

---

# 9️⃣ NOMENCLATURA CLARA

Proibido:

data
item
value
temp
obj

Preferir nomes que expressem intenção.

Código deve ser autoexplicativo.

---

# 🔟 ZERO MÁGICA

Evitar:

- Valores mágicos
- Strings hardcoded repetidas
- Números sem significado

Se usar constante → nomear claramente.

---

# 11️⃣ CHECKLIST OBRIGATÓRIO ANTES DE FINALIZAR

Antes de gerar resposta final, a IA deve verificar:

[ ] Função está pequena e clara?  
[ ] Existe duplicação?  
[ ] Existe overengineering?  
[ ] JSX está legível?  
[ ] Complexidade está baixa?  
[ ] Nome das variáveis está claro?  
[ ] Existe responsabilidade única?  
[ ] Pode ser mais simples?  

Se qualquer resposta for "não":
→ Refatorar antes de entregar.

---

# 🎯 META DE QUALIDADE

O código deve:

- Ser entendido em 30 segundos
- Não exigir explicação verbal
- Ser fácil de modificar
- Ter baixa carga cognitiva
- Parecer escrito por alguém experiente

---

# 🧠 REGRA FINAL

Código simples é código profissional.

Soluções complexas só são aceitáveis quando o problema é realmente complexo.