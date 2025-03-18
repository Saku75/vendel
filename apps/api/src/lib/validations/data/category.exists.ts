import { eq } from "drizzle-orm";

import { database } from "$lib/database";
import { categoriesSchema } from "$lib/database/schema/categories";

async function categoryExists(categoryId: string) {
  return !!(
    await database()
      .select({ id: categoriesSchema.id })
      .from(categoriesSchema)
      .where(eq(categoriesSchema.id, categoryId))
  ).length;
}

export { categoryExists };
