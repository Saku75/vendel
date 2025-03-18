import { eq } from "drizzle-orm";

import { database } from "$lib/database";
import { usersSchema } from "$lib/database/schema/users";

async function userExists(userId: string) {
  return !!(
    await database()
      .select({ id: usersSchema.id })
      .from(usersSchema)
      .where(eq(usersSchema.id, userId))
  ).length;
}

export { userExists };
