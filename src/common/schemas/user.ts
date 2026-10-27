import { z } from "@/config/zod-config";

export const loginSchema = z.object({
  email: z.string().email(),
});

export const credentialsLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Informe a senha"),
});

export type ILogin = z.infer<typeof loginSchema>;
export type ICredentialsLogin = z.infer<typeof credentialsLoginSchema>;
