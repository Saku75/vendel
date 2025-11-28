import { eq } from "drizzle-orm";

import { db } from "$lib/database";
import { refreshTokenFamilies } from "$lib/database/schema/refresh-token-families";
import type { ServerContext } from "$lib/server";
import { getAuth } from "$lib/server/middleware/require-auth";
import { deleteCookie } from "$lib/utils/cookies";

async function signOut(c: ServerContext): Promise<void> {
  const auth = getAuth(c, { allowExpired: true });

  await Promise.all([
    db
      .delete(refreshTokenFamilies)
      .where(eq(refreshTokenFamilies.id, auth.refresh.family)),
  ]);

  deleteCookie(c, "access");
  deleteCookie(c, "refresh");
}

export { signOut };
