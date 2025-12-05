import { env } from "cloudflare:workers";

import { MailService } from "@package/mail-service";

const mailService = new MailService(
  env.RESEND_API_KEY,
  {
    baseUrl: env.CORS_ORIGINS.split(",")[0],
  },
  env.MODE === "local",
);

export { mailService };
