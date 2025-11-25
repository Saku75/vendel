import { env } from "cloudflare:workers";

import { MailService } from "@package/mail-service";

/**
 * Singleton mail service instance
 * Created once per Worker isolate
 */
export const mailService = new MailService(
  env.RESEND_API_KEY,
  {
    baseURL: env.CORS_ORIGINS.split(",")[0],
  },
  env.MODE === "local",
);
