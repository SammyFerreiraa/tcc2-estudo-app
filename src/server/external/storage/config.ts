import { Storage } from "@google-cloud/storage";
import { env } from "@/config/env";

const storage = new Storage({
  credentials: {
    type: env.GCP_TYPE,
    project_id: env.GCP_PROJECT_ID,
    private_key_id: env.GCP_PRIVATE_KEY_ID,
    client_email: env.GCP_CLIENT_EMAIL,
    client_id: env.GCP_CLIENT_ID,
    universe_domain: env.GCP_UNIVERSE_DOMAIN,
    private_key: env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

export const defaultBucket = storage.bucket(env.GCP_STORAGE_BUCKET ?? "default");
