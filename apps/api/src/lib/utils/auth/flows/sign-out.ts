import { eq } from "drizzle-orm";
import { Context } from "hono";

import { HonoEnv } from "$lib/server";
import { refreshTokenFamilies } from "$lib/server/database/schema/refresh-token-families";

import { deleteAuthCookie, deleteAuthRefreshCookie } from "../cookies";

async function signOut(c: Context<HonoEnv>, refreshTokenFamilyId: string) {
  c.var.database
    .delete(refreshTokenFamilies)
    .where(eq(refreshTokenFamilies.id, refreshTokenFamilyId));

  deleteAuthCookie(c);
  deleteAuthRefreshCookie(c);
}

export { signOut };
