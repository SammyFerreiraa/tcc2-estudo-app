# ANTI-PATTERNS — Parte 2: Template (tRPC, Prisma, Zod, Next.js)

Anti-patterns específicos da stack deste projeto: tRPC, Prisma, Zod, React Hook Form, permissões e rotas.
Complemento de `anti-patterns.md` (código genérico e TypeScript).

---

## 1) Router tRPC "gordo"

### ❌ Ruim (toda lógica inline no router)

```ts
export const postsRouter = createTRPCRouter({
  create: procedures.protected
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => {
      // 50 linhas de validação...
      // 30 linhas de transformação...
      // 20 linhas de lógica de negócio...
      const post = await prisma.post.create({ data: input });
      return post;
    }),
  // ... mais procedures gordos
});
```

### ✅ Bom (separar methods + repository)

```ts
// server/routers/posts/router.ts
export const postsRouter = createTRPCRouter({
  list: findPosts,
  getById: getPostById,
  create: createPost,
  update: updatePost,
  delete: deletePost,
});
```

```ts
// server/routers/posts/methods/create-post.ts
export const createPost = procedures.protected
  .input(createPostSchema)
  .mutation(async ({ input, ctx }) => {
    return await postRepository.create(input, ctx.session.id);
  });
```

**Nota:** para CRUDs simples sem lógica extra, procedures inline no `router.ts` são aceitáveis.

---

## 2) Prisma direto no router (sem repository)

### ❌ Ruim

```ts
export const findPosts = procedures.public
  .input(getPostsSchema)
  .query(async ({ input }) => {
    const posts = await prisma.post.findMany({
      where: { name: { contains: input.search } },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
      take: input.limit,
      skip: input.offset,
    });
    const total = await prisma.post.count({ where: { name: { contains: input.search } } });
    return { posts, total };
  });
```

### ✅ Bom (repository encapsula acesso ao banco)

```ts
// methods/find-posts.ts
export const findPosts = procedures.public
  .input(getPostsSchema)
  .query(async ({ input }) => {
    return await postRepository.findMany(input);
  });
```

O repository centraliza queries reutilizáveis e evita duplicação de `include`/`select`.

---

## 3) Schema Zod duplicado entre cliente e servidor

### ❌ Ruim (schema definido em cada lugar)

```ts
// NO CLIENTE
const formSchema = z.object({ name: z.string().min(1).max(100) });
// NO SERVIDOR (cópia)
const serverSchema = z.object({ name: z.string().min(1).max(100) });
```

### ✅ Bom (schema único em `/src/common/schemas/`)

```ts
// src/common/schemas/post.ts
export const createPostSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  content: z.string().min(1, "Conteúdo é obrigatório").max(1000),
});
export type ICreatePost = z.infer<typeof createPostSchema>;
```

Cliente e servidor importam o **mesmo** schema.

---

## 4) Server Action inline em Client Component

### ❌ Ruim

```tsx
"use client";
export function MyForm() {
  async function handleAction(formData: FormData) {
    "use server";
    await prisma.post.create({ data: { name: formData.get("name") as string } });
  }
  return <form action={handleAction}>...</form>;
}
```

### ✅ Bom (Server Action em arquivo separado)

```ts
// src/server/actions/posts.ts
"use server";
export async function createPostAction(formData: FormData) {
  const name = formData.get("name") as string;
  return await postRepository.create({ name, content: "" }, "userId");
}
```

```tsx
// src/interface/features/posts/components/post-form.tsx
"use client";
import { createPostAction } from "@/server/actions/posts";
export function PostForm() {
  return <form action={createPostAction}>...</form>;
}
```

---

## 5) Rota sem configuração em `route-control.ts`

### ❌ Ruim (criar página sem registrar rota)

```
// Criou src/app/(protected)/reports/page.tsx
// MAS NÃO adicionou em route-control.ts
// ❌ O middleware vai bloquear acesso!
```

### ✅ Bom (configurar ANTES de criar a página)

```ts
// 1. Primeiro: src/config/route-control.ts
export const routesPermissions = [
  { path: "/reports", rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER] },
];
// 2. Depois: src/app/(protected)/reports/page.tsx
```

---

## 6) Permissão apenas no cliente (sem server-side)

### ❌ Ruim (confia só no UI para proteger)

```tsx
"use client";
export function AdminPanel() {
  const { user } = useSession();
  if (user?.role !== "ADMIN") return null;
  return <Button onClick={() => api.admin.deleteAll.mutate()}>Apagar tudo</Button>;
}

// No servidor: ZERO verificação
export const deleteAll = procedures.protected.mutation(async () => {
  await prisma.post.deleteMany();
});
```

### ✅ Bom (verificar no servidor E no cliente)

```tsx
// Cliente: feedback visual
const canDelete = user && checkPermission(user.role, [Permissions.HARD_DELETE]);
if (!canDelete) return null;
```

```ts
// Servidor: proteção real
if (!checkPermission(ctx.session.role, [Permissions.HARD_DELETE])) {
  throw new TRPCError({ code: "FORBIDDEN", message: "Permissão insuficiente" });
}
```

---

## 7) Chamada de API direta no componente React

### ❌ Ruim

```tsx
"use client";
export function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then(setUsers);
  }, []);
  return <div>{users.map((u) => <span key={u.id}>{u.name}</span>)}</div>;
}
```

### ✅ Bom (usar tRPC)

```tsx
"use client";
import { api } from "@/config/trpc/react";

export function UserList() {
  const { data: users, isLoading } = api.users.list.useQuery();
  if (isLoading) return <Spinner />;
  return <div>{users?.map((u) => <span key={u.id}>{u.name}</span>)}</div>;
}
```

Para dados sem interatividade: usar Server Component com `apiServer`.

---

## 8) Server Component com interatividade

### ❌ Ruim

```tsx
// SEM "use client" — Server Component
import { useState } from "react"; // ❌ Hooks não funcionam aqui
export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### ✅ Bom (separar Client/Server)

```tsx
// Client Component para interatividade
"use client";
export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

```tsx
// Server Component orquestra e passa dados
export default async function ExamplePage() {
  const data = await apiServer.example.getData.query();
  return <div><h1>{data.title}</h1><Counter /></div>;
}
```

---

## 9) Formulário sem React Hook Form + Zod

### ❌ Ruim (formulário manual com useState para cada campo)

```tsx
const [name, setName] = useState("");
const [errors, setErrors] = useState<Record<string, string>>({});

const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  if (!name) setErrors({ name: "Obrigatório" });
  // validação manual...
};
```

### ✅ Bom (React Hook Form + Zod + componentes do projeto)

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostSchema, type ICreatePost } from "@/common/schemas/post";
import { Input } from "@/interface/components/ui/input";
import { Button } from "@/interface/components/ui/button";

export function CreatePostForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ICreatePost>({
    resolver: zodResolver(createPostSchema),
  });

  const createMutation = api.posts.create.useMutation();

  return (
    <form onSubmit={handleSubmit((data) => createMutation.mutateAsync(data))}>
      <Input label="Nome" {...register("name")} error={errors.name?.message} />
      <Button type="submit" isLoading={isSubmitting}>Criar</Button>
    </form>
  );
}
```

---

## 10) Erro silencioso (engolir erro)

### ❌ Ruim

```ts
try {
  await postRepository.create(input, userId);
} catch {
  // silêncio total
}
```

### ✅ Bom (tratar ou propagar com intenção)

```ts
try {
  await postRepository.create(input, userId);
} catch (error) {
  if (error instanceof Error && error.message === "Unauthorized") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
  }
  throw error;
}
```

---

## 11) Mutation sem feedback visual

### ❌ Ruim

```tsx
<Button onClick={() => deleteMutation.mutate({ id: post.id })}>Deletar</Button>
```

### ✅ Bom (loading + feedback)

```tsx
const deleteMutation = api.posts.delete.useMutation({
  onSuccess: () => toast.success("Post deletado"),
  onError: (error) => toast.error(error.message),
});

<Button
  variant="destructive"
  isLoading={deleteMutation.isPending}
  onClick={() => deleteMutation.mutate({ id: post.id })}
>
  Deletar
</Button>
```

---

## Checklist de refatoração rápida

- [ ] Early return resolve?
- [ ] Dá pra extrair função/subcomponente/hook?
- [ ] Existe duplicação real?
- [ ] Estou criando abstração "por medo do futuro"?
- [ ] Schema Zod está em `/src/common/schemas/`?
- [ ] Permissão validada **também no servidor**?
- [ ] `route-control.ts` está atualizado?
- [ ] Usando `type` em vez de `interface`?
- [ ] Usando tRPC em vez de `fetch` direto?
- [ ] Repository encapsula o Prisma?

---

## Regra final

> Código sênior é aquele que você consegue **mudar sem medo** e **entender em 30 segundos**.
