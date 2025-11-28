import { Context } from "hono";
import { createMiddleware } from "hono/factory";

import { authSessions } from "$lib/auth/sessions";
import { AuthStatus } from "$lib/enums/auth/status";
import { ServerEnv } from "$lib/server";
import { AuthAccessToken } from "$lib/types/auth/tokens/access";
import { deleteCookie, getCookieWithToken } from "$lib/utils/cookies";

function clearAuthAndSetUnauthenticated(c: Context<ServerEnv>) {
  deleteCookie(c, "access");
  deleteCookie(c, "refresh");
  c.set("auth", { status: AuthStatus.Unauthenticated });
}

const authMiddleware = createMiddleware<ServerEnv>(async (c, next) => {
  try {
    const access = await getCookieWithToken<AuthAccessToken>(c, "access");

    if (!access || !access.verified) {
      clearAuthAndSetUnauthenticated(c);
      await next();
      return;
    }

    const { sessionId, user} = access.token.data;
    const authSession = await authSessions.get(sessionId);

    if (!authSession || authSession.refreshToken.used) {
      clearAuthAndSetUnauthenticated(c);
      await next();
      return;
    }

    c.set("auth", {
      status: access.expired ? AuthStatus.Expired : AuthStatus.Authenticated,
      sessionId,
      user,
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    clearAuthAndSetUnauthenticated(c);
  }

  await next();
});

export { authMiddleware };
