import { hexToBytes } from "@noble/hashes/utils";
import { createMiddleware } from "hono/factory";

import { Token } from "@repo/token";

import { HonoEnv } from "$lib/utils/app";

const tokenMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const { TOKEN_ENCRYPTION_KEY, TOKEN_SIGNING_KEY } = c.env;

  c.set(
    "token",
    new Token(
      {
        encryption: hexToBytes(TOKEN_ENCRYPTION_KEY),
        signing: hexToBytes(TOKEN_SIGNING_KEY),
      },
      { issuer: c.env.API_ORIGIN },
    ),
  );

  await next();
});

export { tokenMiddleware };
