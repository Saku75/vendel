import { eq } from "drizzle-orm";

import { database } from "$lib/database";
import { wishlistUsersSchema } from "$lib/database/schema/wishlist-users";

async function wishlistUserExists(wishlistUserId: string) {
  return !!(
    await database()
      .select({ id: wishlistUsersSchema.id })
      .from(wishlistUsersSchema)
      .where(eq(wishlistUsersSchema.id, wishlistUserId))
  ).length;
}

export { wishlistUserExists };
