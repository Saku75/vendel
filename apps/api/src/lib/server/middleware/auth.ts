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
  const authCookie = getAuthCookie(c);

  if (authCookie && authCookie.valid) {
    const { user, refreshToken } = authCookie.payload.data;

    c.set("auth", {
      status: authCookie.expired
        ? AuthStatus.Expired
        : AuthStatus.Authenticated,
      authToken: { expiresAt: authCookie.payload.expiresAt },
      refreshToken,
      user,
    });
  } else {
    if ((authCookie && !authCookie.valid) || authCookie === null) {
      deleteAuthCookie(c);
      deleteAuthRefreshCookie(c);
    }

    c.set("auth", { status: AuthStatus.Unauthenticated });
  }

  if (authCookie) {
    const { refreshToken } = authCookie.payload.data;

    const authSession = await getAuthSession(c, refreshToken.id);

    if (
      authSession?.refreshToken.invalidated ||
      authSession?.refreshToken.used
    ) {
      c.set("auth", { status: AuthStatus.Unauthenticated });

      deleteAuthCookie(c);
      deleteAuthRefreshCookie(c);
    }
  }

  await next();
});

export { authMiddleware };
