import { eq } from "drizzle-orm";

import { AuthStatus } from "$lib/enums";
import { app } from "$lib/server";
import { users } from "$lib/server/database/schema/users";
import { requireAuth } from "$lib/server/middleware/require-auth";
import { User } from "$lib/types";
import { Err, Ok } from "$lib/types/result";
import { signOut } from "$lib/utils/auth/flows/sign-out";

const whoAmIRoute = app();

type WhoAmIResponse = {
  user: Omit<
    User,
    "password" | "clientSalt" | "serverSalt" | "createdAt" | "updatedAt"
  >;
  session: {
    expiresAt: number;
  };
};

whoAmIRoute.get("/", requireAuth(), async (c) => {
  // requireAuth middleware guarantees auth is authenticated
  const auth = c.var.auth as NonNullable<typeof c.var.auth> & {
    status: AuthStatus.Authenticated;
  };

  const user = await c.var.database
    .select({
      id: users.id,
      firstName: users.firstName,
      middleName: users.middleName,
      lastName: users.lastName,
      email: users.email,
      emailVerified: users.emailVerified,
      role: users.role,
      approved: users.approved,
      approvedBy: users.approvedBy,
    })
    .from(users)
    .where(eq(users.id, auth.user.id));

  if (!user.length) {
    await signOut(c, { refreshTokenId: auth.refreshToken.id });

    return c.json(
      {
        ok: false,
        status: 400,
        message: "User does not exist",
      } satisfies Err,
      400,
    );
  }

  return c.json({
    ok: true,
    status: 200,
    data: {
      user: user[0],
      session: {
        expiresAt: auth.authToken.expiresAt,
      },
    },
  } satisfies Ok<WhoAmIResponse>);
});

export { whoAmIRoute };
export type { WhoAmIResponse };
