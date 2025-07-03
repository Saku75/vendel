import { createMiddleware } from "hono/factory";

import { AuthStatus } from "$lib/enums";
import { HonoEnv } from "$lib/server";
import {
  deleteAuthCookie,
  deleteAuthRefreshCookie,
  getAuthCookie,
} from "$lib/utils/auth/cookies";

const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const authCookie = getAuthCookie(c);

  if (authCookie && authCookie.valid) {
    const { refreshToken, user } = authCookie.payload.data;

    c.set("auth", {
      status: authCookie.expired
        ? AuthStatus.Expired
        : AuthStatus.Authenticated,
      authToken: { expiresAt: authCookie.payload.expiresAt },
      refreshToken,
      user,
    });
  } else {
    if (authCookie && !authCookie.valid) {
      deleteAuthCookie(c);
      deleteAuthRefreshCookie(c);
    }

    c.set("auth", { status: AuthStatus.Unauthenticated });
  }

  await next();
});

export { authMiddleware };
