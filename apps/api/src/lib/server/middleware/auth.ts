import { createMiddleware } from "hono/factory";

import { AuthStatus } from "$lib/enums";
import { HonoEnv } from "$lib/server";
import {
  deleteAuthCookie,
  deleteAuthRefreshCookie,
  getAuthCookie,
} from "$lib/utils/auth/cookies";
import { getAuthSession } from "$lib/utils/auth/session";

const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const authCookie = await getAuthCookie(c);

  try {
    if (authCookie && authCookie.verified) {
      const { user, refreshToken } = authCookie.token.data;

      c.set("auth", {
        status: authCookie.expired
          ? AuthStatus.Expired
          : AuthStatus.Authenticated,
        authToken: { expiresAt: authCookie.token.metadata.expiresAt },
        refreshToken,
        user,
      });
    } else {
      if ((authCookie && !authCookie.verified) || authCookie === null) {
        deleteAuthCookie(c);
        deleteAuthRefreshCookie(c);
      }

      c.set("auth", { status: AuthStatus.Unauthenticated });
    }

    if (authCookie) {
      const { refreshToken } = authCookie.token.data;

      const authSession = await getAuthSession(c, refreshToken.id);

      if (authSession?.refreshToken.used) {
        c.set("auth", { status: AuthStatus.Unauthenticated });

        deleteAuthCookie(c);
        deleteAuthRefreshCookie(c);
      }
    }
  } catch {
    deleteAuthCookie(c);
    deleteAuthRefreshCookie(c);
  }

  await next();
});

export { authMiddleware };
