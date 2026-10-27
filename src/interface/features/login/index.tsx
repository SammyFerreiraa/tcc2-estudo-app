"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { ICredentialsLogin } from "@/common/schemas/user";
import { credentialsLoginSchema, loginSchema } from "@/common/schemas/user";
import { apiClient } from "@/config/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/card";
import { Google } from "@/interface/components/icons";
import { Button } from "@/interface/components/ui/button";
import { InputForm, InputPassword } from "@/interface/components/ui/input";

export const LoginPage = () => {
  const {
    formState: { isSubmitting, errors },
    control,
    handleSubmit,
    getValues,
    trigger,
  } = useForm<ICredentialsLogin>({
    resolver: zodResolver(credentialsLoginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutateAsync: signInCredentials } = apiClient.auth.signInCredentials.useMutation({
    onSuccess: () => {
      // Navegação completa para não reaproveitar o cache do roteador (que guarda o redirect para /login)
      window.location.replace("/");
    },
  });

  const { mutateAsync } = apiClient.auth.signInEmail.useMutation({
    onSuccess: () => {
      toast.success("Foi enviado um link de acesso para o seu e-mail");
    },
  });

  const submitWithPassword = async (data: ICredentialsLogin) => {
    await signInCredentials(data);
  };

  const submitWithMagicLink = async () => {
    const parsed = loginSchema.safeParse({ email: getValues("email") });
    if (!parsed.success) {
      await trigger("email");
      return;
    }
    await mutateAsync(parsed.data);
  };

  const submitWithGoogle = async () => {
    window.location.href = "/api/auth/signin/google";
  };

  return (
    <div className="min-h flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center font-bold text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            className="flex w-full items-center justify-center gap-2"
            onClick={submitWithGoogle}
            type="button"
            variant="outline"
          >
            <Google />
            Entrar com Google
          </Button>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-gray-500 text-sm">ou</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(submitWithPassword)}>
            <InputForm
              autoComplete="email"
              control={control}
              error={errors.email?.message}
              label="E-mail"
              name="email"
              type="email"
            />
            <InputPassword
              autoComplete="current-password"
              control={control}
              error={errors.password?.message}
              label="Senha"
              name="password"
            />
            <Button className="w-full" isLoading={isSubmitting} type="submit">
              Entrar
            </Button>
            <Button className="w-full" onClick={submitWithMagicLink} type="button" variant="ghost">
              Receber link de acesso por e-mail
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
