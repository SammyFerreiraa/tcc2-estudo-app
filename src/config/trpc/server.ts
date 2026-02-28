import "server-only";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { cache } from "react";
import { createTRPCContext } from "@/server/config/trpc";
import { type AppRouter, createCaller } from "@/server/root";
import { createQueryClient } from "./query-client";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(() => {
  const heads = new Headers(headers() as unknown as HeadersInit);
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
    resHeaders: heads,
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: apiServer, HydrateClient } = createHydrationHelpers<AppRouter>(caller, getQueryClient);
