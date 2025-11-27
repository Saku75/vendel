import { env } from "cloudflare:workers";

import type { AuthAccessToken } from "$lib/types/auth/tokens/access";
import { AuthRefreshToken } from "$lib/types/auth/tokens/refresh";
import { createKV } from "$lib/utils/create-kv";

type AuthSession = {
  refreshToken: AuthRefreshToken & {
    expiresAt: number;
    used: boolean;
  };

  user: AuthAccessToken["user"];
};

const authSessions = createKV<AuthSession>(env.KV, {
  prefix: "auth:session",
});

export { authSessions };
export type { AuthSession };
