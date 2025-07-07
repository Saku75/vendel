import { AuthStatus } from "$lib/enums";
import { app } from "$lib/server";
import { Err, Ok } from "$lib/types/result";
import { getAuthRefreshCookie } from "$lib/utils/auth/cookies";
import { refreshSession } from "$lib/utils/auth/flows/refresh";

const refreshRoute = app();

refreshRoute.post("/", async (c) => {
  const auth = c.var.auth;

  if (auth.status === AuthStatus.Unauthenticated) {
    return c.json(
      {
        ok: false,
        status: 401,
        message: "Not authenticated",
      } satisfies Err,
      401,
    );
  }

  const refreshCookie = getAuthRefreshCookie(c);

  if (!refreshCookie || !refreshCookie.valid) {
    return c.json(
      {
        ok: false,
        status: 401,
        message: "Invalid refresh token",
      } satisfies Err,
      401,
    );
  }

  // Type assertion is safe here since we checked status above
  const authenticatedAuth = auth as NonNullable<typeof auth> & {
    status: AuthStatus.Authenticated | AuthStatus.Expired;
  };

  const result = await refreshSession(c, {
    refreshTokenId: refreshCookie.payload.data.id,
    authRefreshTokenId: authenticatedAuth.refreshToken.id,
  });

  if (!result.success) {
    return c.json(
      {
        ok: false,
        status: 401,
        message: result.error,
      } satisfies Err,
      401,
    );
  }

  return c.json(
    {
      ok: true,
      status: 200,
      message: "Session refreshed",
    } satisfies Ok,
    200,
  );
});

export { refreshRoute };
