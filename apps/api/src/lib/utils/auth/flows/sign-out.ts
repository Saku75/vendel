import { eq } from "drizzle-orm";
import { Context } from "hono";

import { HonoEnv } from "$lib/server";
import { refreshTokenFamilies } from "$lib/server/database/schema/refresh-token-families";
import { refreshTokens } from "$lib/server/database/schema/refresh-tokens";

import { deleteAuthCookie, deleteAuthRefreshCookie } from "../cookies";
import { getAuthSession, setAuthSession } from "../session";

async function signOut(
  c: Context<HonoEnv>,
  { refreshTokenId }: { refreshTokenId: string },
) {
  const authSession = await getAuthSession(c, refreshTokenId);

  if (authSession) {
    const { user, refreshToken } = authSession;

    await Promise.all([
      c.var.database
        .update(refreshTokenFamilies)
        .set({ invalidated: true })
        .where(eq(refreshTokenFamilies.id, refreshToken.family)),
      c.var.database
        .update(refreshTokens)
        .set({ used: true })
        .where(eq(refreshTokens.id, refreshToken.id)),
      setAuthSession(
        c,
        refreshToken.id,
        {
          refreshToken: { ...refreshToken, used: true },
          user,
        },
        { expiration: refreshToken.expiresAt / 1000 },
      ),
    ]);
  }

  deleteAuthCookie(c);
  deleteAuthRefreshCookie(c);
}

export { signOut };
