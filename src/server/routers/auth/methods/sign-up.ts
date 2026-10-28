import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { createTokens, setAuthCookies } from "@/common/auth";
import { signUpSchema } from "@/common/schemas/user";
import { procedures } from "@/server/config/trpc";
import { authRepository } from "../repository";

const PASSWORD_SALT_ROUNDS = 10;

const emailInUseError = () =>
  new TRPCError({
    code: "CONFLICT",
    message: "Este e-mail já está cadastrado",
  });

export const signUp = procedures.public.input(signUpSchema).mutation(async ({ input }) => {
  if (await authRepository.findUserByEmail(input.email)) {
    throw emailInUseError();
  }

  const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

  const created = await authRepository
    .createMember({ name: input.name, email: input.email, passwordHash })
    .catch((error: unknown) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw emailInUseError();
      }
      throw error;
    });

  const user = authRepository.buildSessionUser(created);

  const { accessToken, refreshToken } = await createTokens(user);
  await setAuthCookies(accessToken, refreshToken);

  return { success: true, user };
});
