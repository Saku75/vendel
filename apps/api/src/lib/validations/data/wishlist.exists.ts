import { eq } from "drizzle-orm";

import { database } from "$lib/database";
import { wishlistsSchema } from "$lib/database/schema/wishlists";

async function wishlistExists(wishlistId: string) {
  return !!(
    await database()
      .select({ id: wishlistsSchema.id })
      .from(wishlistsSchema)
      .where(eq(wishlistsSchema.id, wishlistId))
  ).length;
}

export { wishlistExists };
