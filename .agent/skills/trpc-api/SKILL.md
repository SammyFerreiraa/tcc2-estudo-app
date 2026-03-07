---
trigger: always_on
---

---
applyTo: "**/*.ts,**/*.tsx"
---

# tRPC e API

## 🔄 Organização dos Routers e Procedures tRPC

### **Visão Geral**

O projeto utiliza tRPC para APIs type-safe entre cliente e servidor. A estrutura de routers segue uma organização por
domínio com padrões específicos para promover consistência e manutenibilidade.

### **Estrutura de Arquivos**

```
server/
├── config/
│   └── trpc.ts        # Configuração central do tRPC
├── root.ts            # Router principal que combina todos os sub-routers
└── routers/           # Routers organizados por domínio
    ├── auth/
    │   ├── methods/   # Métodos complexos separados
    │   │   ├── auth-provider.ts
    │   │   ├── session-management.ts
    │   │   └── ...
    │   ├── repository.ts  # Acesso ao banco de dados
    │   └── router.ts      # Definição do router
    └── [domain]/
        ├── methods/   # Métodos separados por responsabilidade
        │   ├── create-[domain].ts
        │   ├── update-[domain].ts
        │   ├── find-[domain].ts
        │   └── delete-[domain].ts
        ├── repository.ts  # Acesso ao banco de dados
        └── router.ts      # Definição do router
```

### **Estrutura Obrigatória para Routers tRPC**

A escolha da estrutura do router tRPC depende da complexidade da lógica de negócio:

#### **Para Lógica Simples (CRUD Básico)**

Utilize procedures inline diretamente no arquivo `router.ts`:

```typescript
// server/routers/simple-entity/router.ts
import { z } from "zod";
import { procedures } from "@/server/config/trpc";
import { simpleEntityRepository } from "./repository";

export const simpleEntityRouter = createTRPCRouter({
   list: procedures.public.input(z.object({ page: z.number().optional() })).query(async ({ input }) => {
      return await simpleEntityRepository.findMany(input);
   }),

   create: procedures.protected.input(simpleEntitySchema).mutation(async ({ input, ctx }) => {
      return await simpleEntityRepository.create(input);
   })

   // ... outros procedures simples
});
```

#### **Para Lógica Complexa (Operações Elaboradas)**

Organize a lógica em arquivos separados dentro da pasta `methods/`:

```
server/routers/complex-entity/
├── methods/
│   ├── find-entities.ts
│   ├── create-entity.ts
│   ├── update-entity.ts
│   └── delete-entity.ts
├── repository.ts
└── router.ts
```

```typescript
// server/routers/complex-entity/methods/create-entity.ts
import { entitySchema } from "@/common/schemas/entity";
import { procedures } from "@/server/config/trpc";
import { TRPCError } from "@trpc/server";
import { entityRepository } from "../repository";

export const createEntity = procedures.protected.input(entitySchema).mutation(async ({ input, ctx }) => {
   if (!ctx.session) {
      throw new TRPCError({
         code: "UNAUTHORIZED",
         message: "Você precisa estar logado para criar um recurso"
      });
   }

   // Lógica complexa, validações, processamento de dados, etc.

   return await entityRepository.create(input, ctx.session.id);
});
```

```typescript
// server/routers/complex-entity/router.ts
import { createTRPCRouter } from "@/server/config/trpc";
import { createEntity } from "./methods/create-entity";
import { deleteEntity } from "./methods/delete-entity";
import { findEntities, getEntityById } from "./methods/find-entities";
import { updateEntity } from "./methods/update-entity";

export const complexEntityRouter = createTRPCRouter({
   // Importa procedures dos arquivos específicos
   list: findEntities,
   getById: getEntityById,
   create: createEntity,
   update: updateEntity,
   delete: deleteEntity
});
```

### **Repository Pattern**

Cada domínio deve ter seu próprio `repository.ts` para encapsular a lógica de acesso ao banco de dados:

```typescript
// server/routers/[domain]/repository.ts
import { db } from "@/server/config/prisma";

export const domainRepository = {
   findMany: async (params: { page?: number; limit?: number }) => {
      const { page = 0, limit = 10 } = params;
      const offset = page * limit;

      return await db.entity.findMany({
         skip: offset,
         take: limit,
         orderBy: { createdAt: "desc" }
      });
   },

   findById: async (id: string) => {
      return await db.entity.findUnique({
         where: { id }
      });
   },

   create: async (data: EntityCreateInput, userId: string) => {
      return await db.entity.create({
         data: {
            ...data,
            user: {
               connect: { id: userId }
            }
         }
      });
   }

   // ... outros métodos de acesso ao banco
};
```

### **Configuração tRPC**

#### **Procedures Disponíveis**

O sistema fornece dois tipos de procedures:

```typescript
// server/config/trpc.ts
export const procedures = {
   public: publicProcedure, // Acessível sem autenticação
   protected: protectedProcedure // Requer usuário autenticado
};
```

#### **Uso de Middlewares**

```typescript
// Exemplo de middleware de erro (já implementado)
const errorHandlingMiddleware = t.middleware(({ ctx, next }) => {
   return asyncLocalStorage.run({ userId: ctx.session?.id }, async () => {
      const result = await next({ ctx });

      if (result && !result.ok) {
         // Tratamento de erros...
      }

      return result;
   });
});

// Exemplo de middleware de autenticação (já implementado)
const authMiddleware = t.middleware(async ({ next, ctx }) => {
   if (!ctx.session) {
      throw new TRPCError({
         code: "UNAUTHORIZED",
         message: "Access token inválido ou expirado"
      });
   }

   return next({
      ctx: {
         ...ctx,
         session: ctx.session
      }
   });
});
```

### **Uso no Cliente**

#### **Hooks React**

```typescript
// Exemplo de uso em um componente React
"use client";
import { api } from "@/config/trpc/react";

export function MyComponent() {
   // Consultas (query)
   const { data, isLoading } = api.posts.list.useQuery({ page: 0 });

   // Mutações (mutation)
   const createMutation = api.posts.create.useMutation({
      onSuccess: () => {
         // Manipular sucesso
      }
   });

   const handleSubmit = (data) => {
      createMutation.mutate(data);
   };

   return (
      // ...
   );
}
```

#### **Server Components**

```typescript
// Exemplo de uso em Server Component
import { apiServer } from "@/config/trpc/server";

export default async function MyPage() {
   const posts = await apiServer.posts.list.query({ page: 0 });

   return (
      <div>
         {posts.map(post => (
            <div key={post.id}>{post.title}</div>
         ))}
      </div>
   );
}
```

### **Tratamento de Erros**

O sistema implementa um tratamento padronizado de erros:

```typescript
// Exemplo em procedure
if (!ctx.session) {
   throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Você precisa estar logado para realizar esta ação"
   });
}

// Códigos de erro tRPC comuns:
// - "UNAUTHORIZED": Usuário não autenticado
// - "FORBIDDEN": Usuário sem permissão
// - "NOT_FOUND": Recurso não encontrado
// - "BAD_REQUEST": Dados inválidos
// - "INTERNAL_SERVER_ERROR": Erro interno do servidor
```

### **Permissões e Autorização**

**SEMPRE** verifique permissões nos procedures que modificam dados:

```typescript
import { checkPermission, Permissions } from "@/common/permissions";

// Em um procedure protegido
if (!checkPermission(ctx.session.role, [Permissions.CREATE])) {
   throw new TRPCError({
      code: "FORBIDDEN",
      message: "Permissão insuficiente para criar registro"
   });
}
```

### **Validação de Input**

Utilize sempre schemas Zod para validação de input:

```typescript
import { z } from "@/config/zod-config";
import { procedures } from "@/server/config/trpc";

export const createItem = procedures.protected
   .input(
      z.object({
         title: z.string().min(3).max(100),
         description: z.string().min(10).optional(),
         status: z.enum(["draft", "published", "archived"])
      })
   )
   .mutation(async ({ input, ctx }) => {
      // O input já está validado pelo Zod
      return await itemRepository.create(input, ctx.session.id);
   });
```

### **Boas Práticas**

1. **SEMPRE** separe a lógica de acesso ao banco no repository
2. **SEMPRE** verifique autenticação nos procedures protegidos
3. **SEMPRE** verifique permissões baseadas no role do usuário
4. **SEMPRE** utilize schemas Zod para validar inputs
5. **SEMPRE** documente o código com comentários claros
6. **PREFIRA** separar a lógica complexa em arquivos na pasta `methods/`
7. **EVITE** duplicação de código entre procedures