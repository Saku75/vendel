import { AuthStatus } from "$lib/enums/auth/status";
import { app } from "$lib/server";
import { requireAuth } from "$lib/server/middleware/require-auth";
import { Ok } from "$lib/types/result";
import { signOut } from "$lib/utils/auth/flows/sign-out";

const signOutRoute = app();

signOutRoute.get("/", requireAuth(), async (c) => {
  const { refreshToken } = c.var.auth as NonNullable<typeof c.var.auth> & {
    status: AuthStatus.Authenticated;
  };

  await signOut(c, { refreshTokenId: refreshToken.id });

  return c.json({
    ok: true,
    status: 200,
    message: "User signed out",
  } satisfies Ok);
});

export { signOutRoute };
