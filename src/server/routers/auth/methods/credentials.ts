import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { createTokens, setAuthCookies } from "@/common/auth";
import { credentialsLoginSchema } from "@/common/schemas/user";
import { procedures } from "@/server/config/trpc";
import { authRepository } from "../repository";

const INVALID_CREDENTIALS_MESSAGE = "E-mail ou senha inválidos";

// Hash válido usado para igualar o tempo de resposta quando o e-mail não existe
const DUMMY_HASH = "$2b$10$eUmb0.iIdP29rmcQbkXhsOJpRSgxq40inWXjGbqGaGELokMt9atsC";

export const signInCredentials = procedures.public.input(credentialsLoginSchema).mutation(async ({ input }) => {
  const user = await authRepository.findUserByEmail(input.email);

  const passwordMatches = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);

  if (!(user?.passwordHash && passwordMatches)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: INVALID_CREDENTIALS_MESSAGE,
    });
  }

  const sessionUser = authRepository.buildSessionUser(user);

  const { accessToken, refreshToken } = await createTokens(sessionUser);
  await setAuthCookies(accessToken, refreshToken);

  return { success: true, user: sessionUser };
});
