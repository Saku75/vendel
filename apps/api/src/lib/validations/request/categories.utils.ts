import { eq } from "drizzle-orm";
import { z } from "zod";

import { database } from "$lib/database";
import { categoriesSchema } from "$lib/database/schema/categories";

const categoryIdExists = z
  .string()
  .nonempty()
  .cuid2()
  .superRefine(async (value, context) => {
    const categories = await database()
      .select({
        id: categoriesSchema.id,
      })
      .from(categoriesSchema)
      .where(eq(categoriesSchema.id, value));

    if (!categories.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
      });
    }
  });

const categoryIdExistsObject = z.object({
  categoryId: categoryIdExists,
});

export { categoryIdExists, categoryIdExistsObject };
