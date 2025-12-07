import { env } from "cloudflare:workers";

import { hexToBytes } from "@package/crypto-utils/bytes";
import { TokenService } from "@package/token-service";

const tokenService = new TokenService(
  {
    encryption: hexToBytes(String(env.TOKEN_ENCRYPTION_KEY)),
    signing: hexToBytes(String(env.TOKEN_SIGNING_KEY)),
  },
  {
    issuer: env.API_ORIGINS.split(",")[0],
    audience: env.CORS_ORIGINS.split(",")[0],
  },
);

export { tokenService };
