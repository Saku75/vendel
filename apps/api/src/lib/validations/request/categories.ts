import { and, eq, ne } from "drizzle-orm";
import { getContext } from "hono/context-storage";
import { z } from "zod";

import { AppEnv } from "$lib/app";
import { database } from "$lib/database";
import { categoriesSchema } from "$lib/database/schema/categories";

import { CategoryNameValidationCode } from "./categories.codes";

const categoryNameValidation = z
  .string()
  .nonempty(CategoryNameValidationCode.Required)
  .max(100, CategoryNameValidationCode.TooLong)
  .superRefine(async (value, context) => {
    const { categoryId } = getContext<AppEnv>().req.param() as {
      categoryId?: string;
    };

    const categories = await database()
      .select({ name: categoriesSchema.name })
      .from(categoriesSchema)
      .where(
        and(
          categoryId ? ne(categoriesSchema.id, categoryId) : undefined,
          eq(categoriesSchema.name, value),
        ),
      );

    if (categories.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: CategoryNameValidationCode.AlreadyExists,
      });
    }
  });

const categoryValidation = z.object({
  name: categoryNameValidation,
});

export { categoryNameValidation, categoryValidation };
