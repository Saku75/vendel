import { env } from "cloudflare:workers";

import type { AuthAccessToken } from "$lib/types/auth/tokens/access";
import { AuthRefreshToken } from "$lib/types/auth/tokens/refresh";
import { createKV } from "$lib/utils/create-kv";

type AuthSession = {
  sessionId: string;

  user: AuthAccessToken["user"];

  refreshToken: Omit<AuthRefreshToken, "sessionId"> & {
    expiresAt: number;
    used: boolean;
  };
};

const authSessions = createKV<AuthSession>(env.KV, {
  prefix: "auth:session",
});

export { authSessions };
export type { AuthSession };
