export {
  authenticate,
  authManager,
  getAuthUrl,
  getAvailableProviders,
  getOAuthProviders,
  getProvider,
  handleCallback,
  registerProvider,
} from "./manager";
export type {
  AuthCredentials,
  AuthProvider,
  AuthResult,
} from "./providers/core";
export { githubProvider } from "./providers/github";
export { googleProvider } from "./providers/google";
export { magicLinkProvider } from "./providers/magic-link";
