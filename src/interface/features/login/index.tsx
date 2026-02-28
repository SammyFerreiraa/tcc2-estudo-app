"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { ILogin } from "@/common/schemas/user";
import { loginSchema } from "@/common/schemas/user";
import { apiClient } from "@/config/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/card";
import { Google } from "@/interface/components/icons";
import { Button } from "@/interface/components/ui/button";
import { InputForm } from "@/interface/components/ui/input";

export const LoginPage = () => {
  const {
    formState: { isSubmitting },
    control,
    handleSubmit,
  } = useForm<ILogin>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const { mutateAsync } = apiClient.auth.signInEmail.useMutation({
    onSuccess: () => {
      toast.success("Foi enviado um link de acesso para o seu e-mail");
    },
  });

  const submitWithEmail = async (data: ILogin) => {
    await mutateAsync({ email: data.email });
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

          <form className="space-y-4" onSubmit={handleSubmit(submitWithEmail)}>
            <div className="space-y-2">
              <InputForm control={control} label="E-mail" name="email" />
            </div>
            <Button className="w-full" isLoading={isSubmitting} type="submit">
              Entrar com E-mail
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
