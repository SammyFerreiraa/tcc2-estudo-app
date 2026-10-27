import { createTRPCRouter } from "@/server/config/trpc";
import { authenticate, getAuthUrl } from "./methods/auth-provider";
import { signInCredentials } from "./methods/credentials";
import { signInEmail } from "./methods/magic-link";
import { getSession, refreshToken, signOut, signOutAll } from "./methods/session-management";
import { verifyToken } from "./methods/verify-token";

export const authRouter = createTRPCRouter({
  // OAuth e autenticação universal
  getAuthUrl,
  authenticate,

  // Session management
  getSession,
  refreshToken,
  signOut,
  signOutAll,

  // E-mail e senha
  signInCredentials,

  // Magic Link
  signInEmail,
  verifyToken,
});
