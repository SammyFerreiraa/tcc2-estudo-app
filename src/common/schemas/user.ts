import { z } from "@/config/zod-config";

export const loginSchema = z.object({
  email: z.string().email(),
});

export const credentialsLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Informe a senha"),
});

export type ILogin = z.infer<typeof loginSchema>;

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(72, "A senha deve ter no máximo 72 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
});

export type ISignUp = z.infer<typeof signUpSchema>;
export type ICredentialsLogin = z.infer<typeof credentialsLoginSchema>;
