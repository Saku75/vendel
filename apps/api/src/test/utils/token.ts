import { hexToBytes } from "@noble/hashes/utils.js";
import { env } from "cloudflare:test";

import { TokenService } from "@package/token-service";

const testToken = new TokenService(
  {
    encryption: hexToBytes(env.TOKEN_ENCRYPTION_KEY),
    signing: hexToBytes(env.TOKEN_SIGNING_KEY),
  },
  { issuer: env.API_ORIGIN, audience: env.CORS_ORIGINS },
);

export { testToken };
