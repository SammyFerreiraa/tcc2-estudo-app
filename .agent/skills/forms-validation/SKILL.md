---
trigger: always_on
---

# Formulários e Validação — Parte 1: Fundamentos

Complemento: ver `forms-validation-advanced.md` para formulários dinâmicos, validações condicionais e uploads.

## 📝 Padrões de Formulários e Validação

### **Visão Geral**

O projeto utiliza uma combinação de **React Hook Form** para gerenciamento de formulários e **Zod** para
validação. Esta abordagem garante formulários eficientes, tipados e com excelente experiência de usuário.

### **Tecnologias e Bibliotecas**

- **React Hook Form**: Gerencia o estado e validação do formulário
- **Zod**: Schema de validação com inferência de tipos TypeScript
- **Componentes de Formulário**: Componentes UI adaptados para integração com React Hook Form

### **Estrutura de Schemas**

Os schemas de validação são definidos usando Zod e armazenados na pasta `/src/common/schemas/`:

```typescript
// src/common/schemas/user.ts
import { z } from "@/config/zod-config";

export const userLoginSchema = z.object({
   email: z.string().email("Email inválido"),
   password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres")
});

export const userRegistrationSchema = z
   .object({
      name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
      email: z.string().email("Email inválido"),
      password: z
         .string()
         .min(8, "A senha deve ter pelo menos 8 caracteres")
         .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
         .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
      confirmPassword: z.string()
   })
   .refine((data) => data.password === data.confirmPassword, {
      message: "As senhas não correspondem",
      path: ["confirmPassword"]
   });

// Inferir tipos a partir do schema
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
```

### **Uso do React Hook Form com Zod**

```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userLoginSchema, type UserLoginInput } from "@/common/schemas/user";
import { Button } from "@/interface/components/ui/button";
import { Input } from "@/interface/components/ui/input";
import { api } from "@/config/trpc/react";
import { useState } from "react";

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<UserLoginInput>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const loginMutation = api.auth.login.useMutation({
    onError: (error) => {
      setServerError(error.message);
    }
  });

  const onSubmit = async (data: UserLoginInput) => {
    setServerError(null);
    await loginMutation.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {serverError}
        </div>
      )}

      <Input
        label="Email"
        {...register("email")}
        error={errors.email?.message}
      />

      <Input
        type="password"
        label="Senha"
        {...register("password")}
        error={errors.password?.message}
        withPasswordToggle
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Entrar
      </Button>
    </form>
  );
}
```

### **Componente Form Reutilizável**

O projeto possui um componente `Form` reutilizável que encapsula a lógica comum de formulários:

```typescript
// src/interface/components/form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  UseFormProps,
  UseFormReturn,
  FieldValues,
  SubmitHandler,
  UseFormRegisterReturn
} from "react-hook-form";
import { z } from "@/config/zod-config";
import { cn } from "@/interface/styles/utils";
import { ReactNode, useState } from "react";

type FormProps<TSchema extends z.ZodType<any, any>, TValues extends FieldValues> = {
  schema: TSchema;
  onSubmit: SubmitHandler<TValues>;
  defaultValues?: UseFormProps<TValues>["defaultValues"];
  className?: string;
  children: (methods: UseFormReturn<TValues> & { isSubmitting: boolean }) => ReactNode;
  id?: string;
};

export function Form<TSchema extends z.ZodType<any, any>, TValues extends z.infer<TSchema>>({
  schema, onSubmit, defaultValues, className, children, id
}: FormProps<TSchema, TValues>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<TValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = async (data: TValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      id={id}
      onSubmit={methods.handleSubmit(handleSubmit)}
      className={cn("space-y-4", className)}
    >
      {children({ ...methods, isSubmitting })}
    </form>
  );
}
```

### **Uso do Componente Form Reutilizável**

```typescript
"use client";
import { Form } from "@/interface/components/form";
import { userLoginSchema, type UserLoginInput } from "@/common/schemas/user";
import { Input } from "@/interface/components/ui/input";
import { Button } from "@/interface/components/ui/button";
import { useState } from "react";
import { api } from "@/config/trpc/react";

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const loginMutation = api.auth.login.useMutation({
    onError: (error) => { setServerError(error.message); }
  });

  const handleSubmit = async (data: UserLoginInput) => {
    setServerError(null);
    await loginMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      {serverError && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{serverError}</div>
      )}

      <Form
        schema={userLoginSchema}
        onSubmit={handleSubmit}
        defaultValues={{ email: "", password: "" }}
      >
        {({ register, formState: { errors }, isSubmitting }) => (
          <>
            <Input label="Email" {...register("email")} error={errors.email?.message} />
            <Input type="password" label="Senha" {...register("password")} error={errors.password?.message} withPasswordToggle />
            <Button type="submit" isLoading={isSubmitting} className="w-full">Entrar</Button>
          </>
        )}
      </Form>
    </div>
  );
}
```

### **Validação no Servidor**

Além da validação no cliente, sempre valide os dados também no servidor usando os mesmos schemas:

```typescript
// server/routers/auth/methods/login.ts
import { userLoginSchema } from "@/common/schemas/user";
import { authManager } from "@/server/auth/manager";
import { procedures } from "@/server/config/trpc";
import { TRPCError } from "@trpc/server";
import { authRepository } from "../repository";

export const login = procedures.public.input(userLoginSchema).mutation(async ({ input }) => {
   const { email, password } = input;

   const user = await authRepository.findUserByEmail(email);

   if (!user || !(await authRepository.verifyPassword(user.id, password))) {
      throw new TRPCError({
         code: "UNAUTHORIZED",
         message: "Email ou senha incorretos"
      });
   }

   const sessionToken = await authManager.createSession(user.id);

   return {
      sessionToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
   };
});
```

### **Boas Práticas**

1. **SEMPRE** defina schemas Zod em `/src/common/schemas/`
2. **SEMPRE** reutilize schemas entre cliente e servidor
3. **SEMPRE** infira tipos TypeScript dos schemas Zod
4. **SEMPRE** inclua mensagens de erro claras e específicas
5. **SEMPRE** implemente validação tanto no cliente quanto no servidor
6. **SEMPRE** utilize o componente `Form` para formulários complexos
7. **SEMPRE** desabilite o botão de envio durante o processamento
8. **SEMPRE** mostre feedback visual claro para erros de validação
9. **SEMPRE** inclua gestão de erros do servidor
10. **SEMPRE** organize campos logicamente e com espaçamento adequado
11. **SEMPRE** utilize os componentes UI do projeto para consistência visual