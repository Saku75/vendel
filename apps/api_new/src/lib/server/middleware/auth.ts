import { Context } from "hono";
import { createMiddleware } from "hono/factory";

import { AuthStatus } from "$lib/enums/auth/status";
import { ServerEnv } from "$lib/server";
import { AuthAccessToken } from "$lib/types/auth/tokens/access";
import { AuthRefreshToken } from "$lib/types/auth/tokens/refresh";
import { deleteCookie, getCookieWithToken } from "$lib/utils/cookies";

function clearAuthAndSetUnauthenticated(c: Context<ServerEnv>) {
  deleteCookie(c, "access");
  deleteCookie(c, "refresh");
  c.set("auth", { status: AuthStatus.Unauthenticated });
}

const authMiddleware = createMiddleware<ServerEnv>(async (c, next) => {
  try {
    const [access, refresh] = await Promise.all([
      getCookieWithToken<AuthAccessToken>(c, "access"),
      getCookieWithToken<AuthRefreshToken>(c, "refresh"),
    ]);

    if (
      !access ||
      !access.verified ||
      !refresh ||
      !refresh.verified ||
      access.token.metadata.id !== refresh.token.data.accessTokenId
    ) {
      clearAuthAndSetUnauthenticated(c);
      await next();
      return;
    }

    c.set("auth", {
      status: access.expired ? AuthStatus.Expired : AuthStatus.Authenticated,
      refresh: {
        ...refresh.token.data,
        expiresAt: refresh.token.metadata.expiresAt,
      },
      access: {
        ...access.token.data,
        expiresAt: access.token.metadata.expiresAt,
      },
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    clearAuthAndSetUnauthenticated(c);
  }

  await next();
});

export { authMiddleware };
