---
trigger: always_on
---

# ANTI-PATTERNS — Parte 1: Código e TypeScript (Senior-grade)

Anti-patterns genéricos de código, JSX, TypeScript e React.
Complemento: ver `anti-patterns-template.md` para anti-patterns específicos do template (tRPC, Prisma, Zod, permissões, rotas).

> **Regra de ouro:** se a solução "simples" resolve, ela é a melhor. Abstrações só existem quando há duplicação ou variação **real**.

---

## 1) JSX com ternários aninhados

### ❌ Ruim

```tsx
return (
  <div>
    {isLoading ? (
      <Spinner />
    ) : error ? (
      <ErrorState message={error.message} />
    ) : data?.length ? (
      <List items={data} />
    ) : (
      <EmptyState />
    )}
  </div>
);
```

### ✅ Bom (variáveis + early return)

```tsx
if (isLoading) return <Spinner />;
if (error) return <ErrorState message={error.message} />;

const hasItems = (data?.length ?? 0) > 0;
return hasItems ? <List items={data!} /> : <EmptyState />;
```

---

## 2) "Props explosion"

### ❌ Ruim

```tsx
<UserCard
  name={user.name}
  email={user.email}
  phone={user.phone}
  role={user.role}
  isAdmin={permissions.isAdmin}
  canEdit={permissions.canEdit}
  canDelete={permissions.canDelete}
  onEdit={handlers.onEdit}
  onDelete={handlers.onDelete}
  onOpen={handlers.onOpen}
/>
```

### ✅ Bom (agrupar props + subcomponentes)

```tsx
<UserCard user={user} permissions={permissions} actions={handlers} />
```

Dentro do componente:

```tsx
function UserCard({ user, permissions, actions }: UserCardProps) {
  return (
    <div>
      <UserHeader user={user} />
      <UserPermissions permissions={permissions} />
      <UserActions actions={actions} />
    </div>
  );
}
```

---

## 3) Prop drilling profundo

### ❌ Ruim

```tsx
<App>
  <Layout>
    <Page user={user} onLogout={onLogout}>
      <Header user={user} onLogout={onLogout}>
        <UserMenu user={user} onLogout={onLogout} />
      </Header>
    </Page>
  </Layout>
</App>
```

### ✅ Bom (colocation / context quando faz sentido)

```tsx
import { useSession } from "@/interface/hooks/useSession";

function UserMenu() {
  const { user } = useSession();
  if (!user) return null;
  return <span>{user.name}</span>;
}
```

---

## 4) useEffect "Deus"

### ❌ Ruim

```tsx
useEffect(() => {
  if (!userId) return;
  setLoading(true);
  fetchUser(userId)
    .then((u) => {
      setUser(u);
      if (u.role === "ADMIN") setShowAdmin(true);
      return fetchStats(u.id);
    })
    .then(setStats)
    .catch(setError)
    .finally(() => setLoading(false));
}, [userId]);
```

### ✅ Bom (tRPC queries — zero useEffect manual)

```tsx
const { data: user, isLoading, error } = api.auth.getSession.useQuery();
const { data: stats } = api.users.getStats.useQuery(
  { userId: user?.id ?? "" },
  { enabled: !!user?.id }
);
const showAdmin = user?.role === "ADMIN";
```

---

## 5) Função gigante com if/else aninhados

### ❌ Ruim

```ts
function processOrder(input: Input) {
  if (!input.user) {
    // ...
  } else {
    if (input.items.length === 0) {
      // ...
    } else {
      if (input.payment === "PIX") { /* ... */ }
      else if (input.payment === "CARD") { /* ... */ }
    }
  }
}
```

### ✅ Bom (guard clauses + estratégia)

```ts
function processOrder(input: Input) {
  if (!input.user) return fail("Missing user");
  if (input.items.length === 0) return fail("Empty order");

  const handler = paymentHandlers[input.payment];
  if (!handler) return fail("Unsupported payment");
  return handler(input);
}

const paymentHandlers: Record<PaymentMethod, (i: Input) => Result> = {
  PIX: handlePix,
  CARD: handleCard,
};
```

---

## 6) "Magic values" espalhados

### ❌ Ruim

```ts
if (attempts > 3) lockAccount();
const timeout = 15000;
```

### ✅ Bom (constantes com intenção)

```ts
const MAX_LOGIN_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 15_000;

if (attempts > MAX_LOGIN_ATTEMPTS) lockAccount();
```

---

## 7) Duplicação "quase igual"

### ❌ Ruim

```ts
function formatPhoneBR(phone: string) { /* ... */ }
function formatPhoneUS(phone: string) { /* ... muito parecido ... */ }
```

### ✅ Bom (extrair núcleo comum)

```ts
function formatPhone(phone: string, pattern: RegExp, template: string) {
  const match = phone.replace(/\D/g, "").match(pattern);
  if (!match) return phone;
  return template.replace(/\$(\d)/g, (_, i) => match[Number(i)] ?? "");
}

const formatPhoneBR = (p: string) =>
  formatPhone(p, /^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
```

---

## 8) Tipos frouxos com `any`

### ❌ Ruim

```ts
function handle(data: any) {
  return data.user.profile.name;
}
```

### ✅ Bom (Zod no boundary, tipo forte no resto)

```ts
import { z } from "@/config/zod-config";

const payloadSchema = z.object({
  user: z.object({ profile: z.object({ name: z.string() }) }),
});

function handle(data: unknown) {
  const parsed = payloadSchema.parse(data);
  return parsed.user.profile.name;
}
```

---

## 9) Comentários óbvios

### ❌ Ruim

```ts
// incrementa contador
count++;
// retorna o usuário
return user;
```

### ✅ Bom — comentários só para: regra de negócio não óbvia, workaround técnico, contexto histórico.

---

## 10) Abstração prematura (overengineering)

### ❌ Ruim

```ts
interface ServiceFactory<T> { create(config: Config): T; }
class PaymentServiceFactory implements ServiceFactory<PaymentService> { /* ... */ }
```

### ✅ Bom

```ts
const paymentService = new PaymentService(config);
```

**Regra:** abstraia quando houver duplicação/variação **real**. Prefira duplicar 2x do que criar abstração ruim.

---

## 11) "Barrel exports" mal usados

### ❌ Ruim

```ts
export * from "./components";
export * from "./hooks";
export * from "./utils";
```

### ✅ Bom (exports explícitos e mínimos)

```ts
export { Button } from "./Button";
export { useAuth } from "./useAuth";
```

---

## 12) Strings de status espalhadas

### ❌ Ruim

```ts
if (order.status === "paid") { /* ... */ }
if (order.status === "PAID") { /* ... */ }
```

### ✅ Bom (union type ou enum do Prisma)

```ts
type OrderStatus = "PAID" | "PENDING" | "CANCELED";

// Ou use o enum gerado pelo Prisma
import { OrderStatus } from "@prisma/client";
if (order.status === OrderStatus.PAID) { /* ... */ }
```

---

## 13) Estado derivável armazenado em `useState`

### ❌ Ruim

```tsx
const [items, setItems] = useState<Item[]>([]);
const [filteredItems, setFilteredItems] = useState<Item[]>([]);
const [totalPrice, setTotalPrice] = useState(0);

useEffect(() => {
  const filtered = items.filter((i) => i.active);
  setFilteredItems(filtered);
  setTotalPrice(filtered.reduce((sum, i) => sum + i.price, 0));
}, [items]);
```

### ✅ Bom (derivar diretamente)

```tsx
const [items, setItems] = useState<Item[]>([]);
const filteredItems = items.filter((i) => i.active);
const totalPrice = filteredItems.reduce((sum, i) => sum + i.price, 0);
```

Se caro, use `useMemo`.

---

## 14) `interface` em vez de `type`

### ❌ Proibido neste projeto

```ts
interface UserProps { name: string; email: string; }
```

### ✅ Obrigatório: usar `type`

```ts
type UserProps = { name: string; email: string };
```

---

## Regra final

> Código sênior é aquele que você consegue **mudar sem medo** e **entender em 30 segundos**.
