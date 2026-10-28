"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { ISignUp } from "@/common/schemas/user";
import { signUpSchema } from "@/common/schemas/user";
import { apiClient } from "@/config/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/card";
import { Button } from "@/interface/components/ui/button";
import { InputForm, InputPassword } from "@/interface/components/ui/input";

export const SignUpPage = () => {
  const {
    formState: { isSubmitting },
    control,
    handleSubmit,
  } = useForm<ISignUp>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const { mutateAsync } = apiClient.auth.signUp.useMutation({
    onSuccess: () => {
      toast.success("Cadastro realizado com sucesso");
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const submit = async (data: ISignUp) => {
    try {
      await mutateAsync(data);
    } catch {}
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center font-bold text-2xl">Cadastro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit(submit)}>
            <InputForm autoComplete="name" control={control} label="Nome" name="name" />
            <InputForm autoComplete="email" control={control} label="E-mail" name="email" />
            <InputPassword autoComplete="new-password" control={control} label="Senha" name="password" />
            <Button className="w-full" isLoading={isSubmitting} type="submit">
              Cadastrar
            </Button>
          </form>

          <p className="text-center text-gray-500 text-sm">
            Já tem uma conta?{" "}
            <Link className="font-semibold text-foreground underline" href="/login">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
