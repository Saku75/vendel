import { hexToBytes } from "@noble/hashes/utils.js";
import { env } from "cloudflare:test";

import { Token } from "@package/token";

const testToken = new Token(
  {
    encryption: hexToBytes(env.TOKEN_ENCRYPTION_KEY),
    signing: hexToBytes(env.TOKEN_SIGNING_KEY),
  },
  { issuer: env.API_ORIGIN },
);

export { testToken };
