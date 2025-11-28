import { eq } from "drizzle-orm";

import { authSessions } from "$lib/auth/sessions";
import { db } from "$lib/database";
import { refreshTokenFamilies } from "$lib/database/schema/refresh-token-families";
import type { ServerContext } from "$lib/server";
import { deleteCookie } from "$lib/utils/cookies";

async function signOut(
  c: ServerContext,
  { sessionId }: { sessionId: string },
): Promise<void> {
  const authSession = await authSessions.get(sessionId);

  if (authSession) {
    const { refreshToken } = authSession;

    await Promise.all([
      db
        .delete(refreshTokenFamilies)
        .where(eq(refreshTokenFamilies.id, refreshToken.family)),
      authSessions.delete(refreshToken.id),
    ]);
  }

  deleteCookie(c, "access");
  deleteCookie(c, "refresh");
}

export { signOut };
