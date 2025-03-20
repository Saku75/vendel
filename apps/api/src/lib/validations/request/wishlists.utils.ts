import { eq } from "drizzle-orm";
import { z } from "zod";

import { database } from "$lib/database";
import { wishlistsSchema } from "$lib/database/schema/wishlists";

const wishlistIdExists = z
  .string()
  .nonempty()
  .cuid2()
  .superRefine(async (value, context) => {
    const wishlists = await database()
      .select({
        id: wishlistsSchema.id,
      })
      .from(wishlistsSchema)
      .where(eq(wishlistsSchema.id, value));

    if (!wishlists.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
      });
    }
  });

const wishlistIdExistsObject = z.object({
  wishlistId: wishlistIdExists,
});

export { wishlistIdExists, wishlistIdExistsObject };
