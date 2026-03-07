---
trigger: always_on
---

# Práticas Proibidas

## 🚫 Práticas Proibidas (Violam Padrões do Projeto)

As seguintes práticas são **ESTRITAMENTE PROIBIDAS** neste projeto, pois violam os padrões de arquitetura, segurança ou
manutenibilidade estabelecidos:

### **🛑 Arquitetura e Estrutura**

1. **NÃO** crie pastas fora da estrutura estabelecida.
2. **NÃO** quebre os padrões de organização por domínio.
3. **NÃO** misture lógica de servidor com componentes cliente (separação de responsabilidades).
4. **NÃO** defina Server Actions inline em Client Components. **SEMPRE** importe-as de arquivos separados.
5. **NÃO** defina regras de negócio no código. Consulte `.project-business-rules.md`.

### **🛑 Rotas e Permissões**

6. **NÃO** crie rotas sem configurar primeiro em `route-control.ts`.
7. **NÃO** implemente acessos de rota ou funcionalidades sem verificar o sistema de permissões.
8. **NÃO** implemente funcionalidades sem verificar permissões baseadas nas regras de negócio.

### **🛑 Banco de Dados**

9. **NÃO** use outros bancos de dados que não sejam PostgreSQL 17.
10. **NÃO** configure o banco sem usar Docker Compose.
11. **NÃO** faça alterações no schema do banco sem usar migrations do Prisma.
12. **NÃO** altere diretamente o banco de dados em produção.
13. **NÃO** ignore migrations pendentes.

### **🛑 APIs e Segurança**

14. **NÃO** configure APIs externas fora da pasta `/src/server/external/`.
15. **NÃO** exponha credenciais de APIs no código-fonte.
16. **NÃO** faça chamadas diretas para APIs externas nos componentes React.
17. **NÃO** implemente autenticação fora do sistema de providers e do fluxo definido.

### **🛑 TypeScript e Código**

18. **NÃO** utilize `interface` para definições de tipos. **SEMPRE** use `type`.
19. **NÃO** ignore ou reimplemente componentes UI existentes.
20. **NÃO** misture múltiplas features em uma única implementação. **SEMPRE** desenvolva feature por feature.

### **🛑 Processo de Desenvolvimento**

21. **NÃO** continue implementando após finalizar um módulo sem aguardar validação do usuário.
22. **NÃO** teste funcionalidades sozinho. **SEMPRE** peça para o usuário testar via navegador.
23. **NÃO** insista em resolver erros sem dados específicos após a segunda tentativa. **SEMPRE** peça detalhes do
    usuário.
24. **NÃO** inicie desenvolvimento sem verificar e configurar o Docker Compose primeiro.

### **🚨 Consequências de Violação**

Ignorar estas restrições pode resultar em:

- Inconsistências na arquitetura do projeto
- Falhas de segurança
- Dificuldades de manutenção
- Conflitos de banco de dados
- Problemas de compatibilidade
- Erros de permissão em produção

### **✅ Alternativas Recomendadas**

Para cada prática proibida, existe uma alternativa recomendada:

| Prática Proibida              | Alternativa Recomendada                      |
| ----------------------------- | -------------------------------------------- |
| Uso de `interface`            | Utilize `type` para todas definições         |
| Rotas sem configuração        | Configure primeiro em `route-control.ts`     |
| Server Actions inline         | Defina em arquivos separados e importe       |
| Chamadas API diretas no React | Use tRPC ou Server Components                |
| Alterar banco sem migrations  | Crie migrations Prisma para todas alterações |
| Testar sozinho                | Solicite teste pelo usuário via navegador    |