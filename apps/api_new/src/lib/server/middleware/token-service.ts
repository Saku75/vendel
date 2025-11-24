import { createMiddleware } from "hono/factory";

import { hexToBytes } from "@package/crypto-utils/bytes";
import { TokenService } from "@package/token-service";

import { ServerEnv } from "$lib/server";

const tokenMiddleware = createMiddleware<ServerEnv>(async (c, next) => {
  const { TOKEN_ENCRYPTION_KEY, TOKEN_SIGNING_KEY } = c.env;

  c.set(
    "tokenService",
    new TokenService(
      {
        encryption: hexToBytes(TOKEN_ENCRYPTION_KEY),
        signing: hexToBytes(TOKEN_SIGNING_KEY),
      },
      {
        issuer: c.env.API_ORIGINS.split(",")[0],
        audience: c.env.CORS_ORIGINS.split(";")[0],
      },
    ),
  );

  await next();
});

export { tokenMiddleware };
