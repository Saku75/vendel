import { Context } from "hono";

import { AuthRole } from "$lib/enums/auth/role";
import { HonoEnv } from "$lib/server";
import { refreshTokenFamilies } from "$lib/server/database/schema/refresh-token-families";
import { refreshTokens } from "$lib/server/database/schema/refresh-tokens";

import { setAuthCookie, setAuthRefreshCookie } from "../cookies";
import { setAuthSession } from "../session";

async function signIn(
  c: Context<HonoEnv>,
  { userId, userRole }: { userId: string; userRole: AuthRole | null },
) {
  const refreshTokenFamily = await c.var.database
    .insert(refreshTokenFamilies)
    .values({ userId })
    .returning({ id: refreshTokenFamilies.id });
  const refreshToken = await c.var.database
    .insert(refreshTokens)
    .values({ refreshTokenFamilyId: refreshTokenFamily[0].id })
    .returning({ id: refreshTokens.id, expiresAt: refreshTokens.expiresAt });

  const expiresAt = refreshToken[0].expiresAt.valueOf();

  await setAuthSession(
    c,
    refreshToken[0].id,
    {
      refreshToken: {
        family: refreshTokenFamily[0].id,
        id: refreshToken[0].id,
        expiresAt,
        invalidated: false,
        used: false,
      },
      user: {
        id: userId,
        role: userRole,
      },
    },
    { expiration: expiresAt / 1000 },
  );

  setAuthCookie(c, refreshToken[0].expiresAt, {
    refreshToken: {
      family: refreshTokenFamily[0].id,
      id: refreshToken[0].id,
      expiresAt: expiresAt,
    },
    user: {
      id: userId,
      role: userRole,
    },
  });
  setAuthRefreshCookie(c, refreshToken[0].expiresAt, {
    family: refreshTokenFamily[0].id,
    id: refreshToken[0].id,
  });
}

export { signIn };
