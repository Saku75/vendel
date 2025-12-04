import type { RequestEvent } from "@sveltejs/kit";

import { hexToBytes } from "@package/crypto-utils/bytes";
import { TokenService } from "@package/token-service";

function createTokenServiceLocal(event: RequestEvent) {
  return new TokenService({
    encryption: hexToBytes(event.platform!.env.TOKEN_ENCRYPTION_KEY),
    signing: hexToBytes(event.platform!.env.TOKEN_SIGNING_KEY),
  });
}

export { createTokenServiceLocal };
