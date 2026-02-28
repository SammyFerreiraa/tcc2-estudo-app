import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    AUTH_SECRET: z.string(),
    AWS_CLOUDWATCH_REGION: z.string(),
    AWS_CLOUDWATCH_ACCESS_KEY_ID: z.string(),
    AWS_CLOUDWATCH_SECRET_ACCESS_KEY: z.string(),
    AWS_CLOUDWATCH_LOG_GROUP_NAME: z.string(),

    //Google Auth
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),

    //Email Auth
    EMAIL_HOST: z.string(),
    EMAIL_PORT: z.string().transform(Number),
    EMAIL_USER: z.string(),
    EMAIL_PASS: z.string(),
    EMAIL_FROM: z.string(),

    //Google Cloud Storage
    GCP_TYPE: z.string().default("service_account"),
    GCP_PROJECT_ID: z.string(),
    GCP_PRIVATE_KEY_ID: z.string(),
    GCP_PRIVATE_KEY: z.string(),
    GCP_CLIENT_EMAIL: z.string(),
    GCP_CLIENT_ID: z.string(),
    GCP_UNIVERSE_DOMAIN: z.string().default("googleapis.com"),
    GCP_STORAGE_BUCKET: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_API_URL: z.string(),
    NEXT_PUBLIC_GCP_STORAGE_BUCKET: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AWS_CLOUDWATCH_REGION: process.env.AWS_CLOUDWATCH_REGION,
    AWS_CLOUDWATCH_ACCESS_KEY_ID: process.env.AWS_CLOUDWATCH_ACCESS_KEY_ID,
    AWS_CLOUDWATCH_SECRET_ACCESS_KEY: process.env.AWS_CLOUDWATCH_SECRET_ACCESS_KEY,
    AWS_CLOUDWATCH_LOG_GROUP_NAME: process.env.AWS_CLOUDWATCH_LOG_GROUP_NAME,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GCP_STORAGE_BUCKET: process.env.NEXT_PUBLIC_GCP_STORAGE_BUCKET,

    //Google Auth
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,

    //Email Auth
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM,

    //Google Cloud Storage
    GCP_STORAGE_BUCKET: process.env.GCP_STORAGE_BUCKET,
    GCP_TYPE: process.env.GCP_TYPE,
    GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
    GCP_PRIVATE_KEY_ID: process.env.GCP_PRIVATE_KEY_ID,
    GCP_CLIENT_EMAIL: process.env.GCP_CLIENT_EMAIL,
    GCP_CLIENT_ID: process.env.GCP_CLIENT_ID,
    GCP_UNIVERSE_DOMAIN: process.env.GCP_UNIVERSE_DOMAIN,
    GCP_PRIVATE_KEY: process.env.GCP_PRIVATE_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
