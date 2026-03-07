---
trigger: always_on
---

# Formulários e Validação — Parte 2: Avançado

Complemento de `forms-validation.md` (fundamentos, schemas, componente Form, validação no servidor).

### **Formulários Dinâmicos**

Para formulários com campos dinâmicos, utilize `useFieldArray` do React Hook Form:

```typescript
"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "@/config/zod-config";
import { Button } from "@/interface/components/ui/button";
import { Input } from "@/interface/components/ui/input";

// Schema para formulário dinâmico
const dynamicFormSchema = z.object({
  title: z.string().min(3),
  items: z.array(
    z.object({
      name: z.string().min(1, "Nome do item obrigatório"),
      quantity: z.number().min(1, "Quantidade deve ser pelo menos 1")
    })
  ).min(1, "Adicione pelo menos um item")
});

type DynamicFormValues = z.infer<typeof dynamicFormSchema>;

export function DynamicForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<DynamicFormValues>({
    resolver: zodResolver(dynamicFormSchema),
    defaultValues: {
      title: "",
      items: [{ name: "", quantity: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const onSubmit = (data: DynamicFormValues) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Título"
        {...register("title")}
        error={errors.title?.message}
      />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Itens</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ name: "", quantity: 1 })}
          >
            Adicionar Item
          </Button>
        </div>

        {errors.items?.root?.message && (
          <p className="text-sm text-red-500">{errors.items.root.message}</p>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-3 items-end">
            <Input
              label="Nome do item"
              {...register(`items.${index}.name`)}
              error={errors.items?.[index]?.name?.message}
              className="flex-1"
            />

            <Input
              type="number"
              label="Quantidade"
              {...register(`items.${index}.quantity`, { valueAsNumber: true })}
              error={errors.items?.[index]?.quantity?.message}
              className="w-32"
            />

            <Button
              type="button"
              variant="ghost"
              className="mb-1"
              onClick={() => remove(index)}
            >
              Remover
            </Button>
          </div>
        ))}
      </div>

      <Button type="submit">Enviar</Button>
    </form>
  );
}
```

### **Validações Condicionais**

Para validações condicionais, utilize a flexibilidade do Zod:

```typescript
// Exemplo de validação condicional com Zod
const paymentSchema = z
   .object({
      paymentMethod: z.enum(["credit", "bank_transfer", "pix"]),

      // Campos que dependem do método de pagamento
      creditCardNumber: z.string().optional(),
      expiryDate: z.string().optional(),
      cvv: z.string().optional(),

      bankName: z.string().optional(),
      accountNumber: z.string().optional(),

      pixKey: z.string().optional()
   })
   .refine(
      (data) => {
         if (data.paymentMethod === "credit") {
            return !!data.creditCardNumber && !!data.expiryDate && !!data.cvv;
         }

         if (data.paymentMethod === "bank_transfer") {
            return !!data.bankName && !!data.accountNumber;
         }

         if (data.paymentMethod === "pix") {
            return !!data.pixKey;
         }

         return true;
      },
      {
         message: "Preencha todos os campos obrigatórios para o método de pagamento selecionado",
         path: ["paymentMethod"]
      }
   );
```

### **Formulários com Uploads de Arquivos**

Para formulários que incluem uploads de arquivos:

```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "@/config/zod-config";
import { Button } from "@/interface/components/ui/button";
import { Input } from "@/interface/components/ui/input";
import { FileUpload } from "@/interface/components/ui/file-upload";
import { useState } from "react";

// Schema com validação de arquivo
const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  // O arquivo é gerenciado separadamente do formulário
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: ""
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    // Validação do arquivo
    if (!file && !userData?.profileImage) {
      setFileError("Por favor, envie uma foto de perfil");
      return;
    }

    // Criar FormData para enviar com o arquivo
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);

    if (file) {
      formData.append("profileImage", file);
    }

    // Enviar para a API
    // await apiCall(formData);
  };

  const handleFileChange = (file: File | null) => {
    setFile(file);
    setFileError(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Nome"
        {...register("name")}
        error={errors.name?.message}
      />

      <Input
        label="Email"
        {...register("email")}
        error={errors.email?.message}
      />

      <FileUpload
        label="Foto de perfil"
        acceptedFileTypes={["image/jpeg", "image/png"]}
        maxSizeInMB={5}
        onChange={handleFileChange}
        error={fileError}
        previewUrl={file ? URL.createObjectURL(file) : undefined}
      />

      <Button type="submit" isLoading={isSubmitting}>
        Salvar perfil
      </Button>
    </form>
  );
}
```
