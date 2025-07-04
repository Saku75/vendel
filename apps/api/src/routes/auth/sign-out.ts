import { AuthStatus } from "$lib/enums";
import { app } from "$lib/server";
import { Err, Ok } from "$lib/types/result";
import { signOut } from "$lib/utils/auth/flows/sign-out";

const signOutRoute = app();

signOutRoute.get("/", async (c) => {
  if (c.var.auth.status !== AuthStatus.Authenticated)
    return c.json(
      {
        ok: false,
        status: 401,
        message: "Not authenticated",
      } satisfies Err,
      401,
    );

  await signOut(c, { refreshTokenId: c.var.auth.refreshToken.id });

  return c.json({
    ok: true,
    status: 200,
    message: "User signed out",
  } satisfies Ok);
});

export { signOutRoute };
