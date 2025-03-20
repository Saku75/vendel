import { and, eq } from "drizzle-orm";
import { getContext } from "hono/context-storage";
import { z } from "zod";

import { AppEnv } from "$lib/app";
import { database } from "$lib/database";
import { wishesSchema } from "$lib/database/schema/wishes";

import { wishlistIdExists } from "./wishlists.utils";

const wishIdExists = z
  .string()
  .nonempty()
  .cuid2()
  .superRefine(async (value, context) => {
    const { wishlistId } = getContext<AppEnv>().req.param();

    const wishes = await database()
      .select({
        id: wishesSchema.id,
        wishlistId: wishesSchema.wishlistId,
      })
      .from(wishesSchema)
      .where(
        and(
          eq(wishesSchema.id, value),
          eq(wishesSchema.wishlistId, wishlistId),
        ),
      );

    if (!wishes.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
      });
    }
  });

const wishIdExistsObject = z.object({
  wishlistId: wishlistIdExists,
  wishId: wishIdExists,
});

export { wishIdExists, wishIdExistsObject };
