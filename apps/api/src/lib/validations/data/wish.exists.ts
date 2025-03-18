import { eq } from "drizzle-orm";

import { database } from "$lib/database";
import { wishesSchema } from "$lib/database/schema/wishes";

async function wishExists(wishId: string) {
  return !!(
    await database()
      .select({ id: wishesSchema.id })
      .from(wishesSchema)
      .where(eq(wishesSchema.id, wishId))
  ).length;
}

export { wishExists };
