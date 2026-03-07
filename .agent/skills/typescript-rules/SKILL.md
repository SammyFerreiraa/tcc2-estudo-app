---
trigger: always_on
---

---
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript e Estrutura de Tipos

## 📐 Regras de TypeScript e Estrutura de Tipos

### **Diretrizes Principais**

- **PRIORIDADE MÁXIMA:** **SEMPRE** utilize `type` para definições de tipos.
- **PROIBIDO:** **NUNCA** utilize `interface`. Substitua por `type` em todos os casos.
- **Motivo:** Consistência e alinhamento com as melhores práticas do projeto.

```typescript
// ✅ CORRETO: Use 'type' para definir tipos
type ComponentProps = {
   title: string;
   children: ReactNode;
};

// ❌ ERRADO: Não use 'interface'
interface ComponentProps {
   title: string;
   children: ReactNode;
}
```

### **Estrutura de Definições**

#### Prefira types aninhados quando possível:

```typescript
// ✅ CORRETO: Types aninhados
type UserWithSettings = {
   id: string;
   name: string;
   settings: {
      theme: "light" | "dark";
      notifications: boolean;
      preferences: {
         language: string;
         timezone: string;
      };
   };
};

// ❌ EVITAR: Types separados sem necessidade
type UserPreferences = {
   language: string;
   timezone: string;
};

type UserSettings = {
   theme: "light" | "dark";
   notifications: boolean;
   preferences: UserPreferences;
};

type User = {
   id: string;
   name: string;
   settings: UserSettings;
};
```

#### Use types utilitários do TypeScript:

```typescript
// Uso de tipos utilitários
type UserResponse = Omit<User, "password">;
type RequiredUser = Required<User>;
type PartialSettings = Partial<UserSettings>;
type ReadonlyUser = Readonly<User>;
```

### **Enums e Union Types**

Prefira union types em vez de enums para valores simples:

```typescript
// ✅ RECOMENDADO: Union types
type UserRole = "admin" | "manager" | "member";

// Apenas use enums se já existir no schema do Prisma ou quando precisar de valores numéricos
enum UserRoleEnum {
   ADMIN = "ADMIN",
   MANAGER = "MANAGER",
   MEMBER = "MEMBER"
}
```

### **Tipagem de Funções**

Sempre defina tipos para parâmetros e retorno de funções:

```typescript
// ✅ CORRETO: Tipagem completa
type FetchUserParams = {
   userId: string;
   includeSettings?: boolean;
};

type FetchUserResult = {
   user: User | null;
   error?: string;
};

const fetchUser = async (params: FetchUserParams): Promise<FetchUserResult> => {
   // implementação
};

// ❌ EVITAR: Tipagem implícita ou parcial
const fetchUser = async ({ userId, includeSettings }) => {
   // implementação
};
```

### **Tipagem de Hooks React**

```typescript
// ✅ CORRETO: Tipar hooks adequadamente
type UseUserResult = {
   user: User | null;
   isLoading: boolean;
   error: Error | null;
   refetch: () => Promise<void>;
};

const useUser = (userId: string): UseUserResult => {
   // implementação
};
```

### **Schemas Zod e Tipos**

Defina tipos a partir dos schemas Zod:

```typescript
import { z } from "zod";

// Primeiro defina o schema
const userSchema = z.object({
   id: z.string().cuid(),
   email: z.string().email(),
   name: z.string().min(2).max(50).optional(),
   role: z.enum(["ADMIN", "MANAGER", "MEMBER"])
});

// Depois infira o tipo a partir do schema
type User = z.infer<typeof userSchema>;
```