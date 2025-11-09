import { hexToBytes } from "@noble/hashes/utils.js";
import { createMiddleware } from "hono/factory";

import { TokenService } from "@package/token-service";

import { HonoEnv } from "$lib/server";

const tokenMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const { TOKEN_ENCRYPTION_KEY, TOKEN_SIGNING_KEY } = c.env;

  c.set(
    "token",
    new TokenService(
      {
        encryption: hexToBytes(TOKEN_ENCRYPTION_KEY),
        signing: hexToBytes(TOKEN_SIGNING_KEY),
      },
      { issuer: c.env.API_ORIGIN, audience: c.env.CORS_ORIGINS },
    ),
  );

  await next();
});

export { tokenMiddleware };
