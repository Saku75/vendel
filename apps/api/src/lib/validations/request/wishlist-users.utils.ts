import { eq } from "drizzle-orm";
import { z } from "zod";

import { database } from "$lib/database";
import { wishlistUsersSchema } from "$lib/database/schema/wishlist-users";

import { userIdExists } from "./users.utils";
import { wishlistIdExists } from "./wishlists.utils";

const wishlistUserIdExists = z
  .string()
  .nonempty()
  .cuid2()
  .superRefine(async (value, context) => {
    const wishlistUsers = await database()
      .select({
        id: wishlistUsersSchema.id,
      })
      .from(wishlistUsersSchema)
      .where(eq(wishlistUsersSchema.id, value));

    if (!wishlistUsers.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
      });
    }
  });

const userWishlistIdExistsObject = z.object({
  userId: userIdExists,
  wishlistUserId: wishlistUserIdExists,
});

const wishlistUserIdExistsObject = z.object({
  wishlistId: wishlistIdExists,
  wishlistUserId: wishlistUserIdExists,
});

export {
  userWishlistIdExistsObject,
  wishlistUserIdExists,
  wishlistUserIdExistsObject,
};
