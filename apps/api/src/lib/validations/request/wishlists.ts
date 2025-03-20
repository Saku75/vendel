import { and, eq, ne } from "drizzle-orm";
import { getContext } from "hono/context-storage";
import { z } from "zod";

import { AppEnv } from "$lib/app";
import { database } from "$lib/database";
import { wishlistsSchema } from "$lib/database/schema/wishlists";

import {
  WishlistDateValidationCode,
  WishlistNameValidationCode,
} from "./wishlists.codes";

const wishlistNameValidation = z
  .string()
  .nonempty(WishlistNameValidationCode.Required)
  .max(100, WishlistNameValidationCode.TooLong)
  .superRefine(async (value, context) => {
    const { wishlistId } = getContext<AppEnv>().req.param() as {
      wishlistId?: string;
    };

    const wishlists = await database()
      .select({ name: wishlistsSchema.name })
      .from(wishlistsSchema)
      .where(
        and(
          wishlistId ? ne(wishlistsSchema.id, wishlistId) : undefined,
          eq(wishlistsSchema.name, value),
        ),
      );

    if (wishlists.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: WishlistNameValidationCode.AlreadyExists,
      });
    }
  });

const wishlistDateValidation = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, WishlistDateValidationCode.Invalid)
  .optional();

const wishlistValidation = z.object({
  name: wishlistNameValidation,
  date: wishlistDateValidation,
});

export { wishlistDateValidation, wishlistNameValidation, wishlistValidation };
