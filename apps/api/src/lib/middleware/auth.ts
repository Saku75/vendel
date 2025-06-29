import { createMiddleware } from "hono/factory";

import { AuthSessionUser } from "$lib/types/auth/session";
import { AuthTokens } from "$lib/types/auth/tokens";
import { HonoEnv } from "$lib/utils/app";

import { getAuthTokens } from "$routes/auth/utils/tokens";

function authSessionUserKey(sessionId: string) {
  return `auth:session:${sessionId}`;
}

const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const authTokens = getAuthTokens(c);

  if (authTokens.auth) {
    const authSessionUser = await c.env.KV.get<AuthSessionUser>(
      authSessionUserKey(authTokens.auth.payload.data.authTokenId),
    );

    if (authSessionUser)
      c.set("auth", {
        tokens: authTokens as AuthTokens,
        user: authSessionUser,
      });
  }

  await next();
});

export { authMiddleware, authSessionUserKey };
