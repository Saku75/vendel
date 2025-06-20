import { hexToBytes } from "@noble/hashes/utils";
import { createMiddleware } from "hono/factory";

import { Token } from "@repo/token";

import { HonoEnv } from "$lib/utils/app";

const tokenMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const { TOKEN_ENCRYPTION_KEY, TOKEN_SIGNING_KEY } = c.env;

  const [encryption, signing] = await Promise.all([
    TOKEN_ENCRYPTION_KEY.get(),
    TOKEN_SIGNING_KEY.get(),
  ]).then((value) => {
    return [hexToBytes(value[0]), hexToBytes(value[1])];
  });

  c.set(
    "token",
    new Token({ encryption, signing }, { issuer: c.env.API_ORIGIN }),
  );

  await next();
});

export { tokenMiddleware };
