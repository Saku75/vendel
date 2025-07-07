import { eq } from "drizzle-orm";
import { Context } from "hono";

import { HonoEnv } from "$lib/server";
import { refreshTokenFamilies } from "$lib/server/database/schema/refresh-token-families";

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
      setAuthSession(c, refreshToken.id, {
        refreshToken: { ...refreshToken, invalidated: true },
        user,
      }),
    ]);
  }

  deleteAuthCookie(c);
  deleteAuthRefreshCookie(c);
}

export { signOut };
