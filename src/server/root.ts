import { createCallerFactory, createTRPCRouter, procedures } from "./config/trpc";
import { authRouter } from "./routers/auth/router";
import { postsRouter } from "./routers/posts/router";
import { uploadRouter } from "./routers/upload";

const p = procedures.protected;

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  posts: postsRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
