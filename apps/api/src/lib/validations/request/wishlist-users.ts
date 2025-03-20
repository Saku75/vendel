import { and, eq, ne } from "drizzle-orm";
import { getContext } from "hono/context-storage";
import { z } from "zod";

import { AppEnv } from "$lib/app";
import { database } from "$lib/database";
import { wishlistUsersSchema } from "$lib/database/schema/wishlist-users";

import {
  WishlistUserUserIdValidationCode,
  WishlistUserWishlistIdValidationCode,
} from "./wishlist-users.codes";

const wishlistUserWishlistIdValidation = z
  .string()
  .nonempty(WishlistUserWishlistIdValidationCode.Required)
  .cuid2(WishlistUserWishlistIdValidationCode.Invalid)
  .superRefine(async (value, context) => {
    const { userId, wishlistUserId } = getContext<AppEnv>().req.param() as {
      userId: string;
      wishlistUserId?: string;
    };

    const wishlistUsers = await database()
      .select({
        wishlistId: wishlistUsersSchema.wishlistId,
        userId: wishlistUsersSchema.userId,
      })
      .from(wishlistUsersSchema)
      .where(
        and(
          wishlistUserId
            ? ne(wishlistUsersSchema.id, wishlistUserId)
            : undefined,
          eq(wishlistUsersSchema.wishlistId, value),
          eq(wishlistUsersSchema.userId, userId),
        ),
      );

    if (wishlistUsers.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: WishlistUserWishlistIdValidationCode.AlreadyExists,
      });
    }
  });

const wishlistUserUserIdValidation = z
  .string()
  .nonempty(WishlistUserUserIdValidationCode.Required)
  .cuid2(WishlistUserUserIdValidationCode.Invalid)
  .superRefine(async (value, context) => {
    const { wishlistId, wishlistUserId } = getContext<AppEnv>().req.param() as {
      wishlistId: string;
      wishlistUserId?: string;
    };

    const wishlistUsers = await database()
      .select({
        wishlistId: wishlistUsersSchema.wishlistId,
        userId: wishlistUsersSchema.userId,
      })
      .from(wishlistUsersSchema)
      .where(
        and(
          wishlistUserId
            ? ne(wishlistUsersSchema.id, wishlistUserId)
            : undefined,
          eq(wishlistUsersSchema.wishlistId, wishlistId),
          eq(wishlistUsersSchema.userId, value),
        ),
      );

    if (wishlistUsers.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: WishlistUserUserIdValidationCode.AlreadyExists,
      });
    }
  });

const userWishlistValidation = z.object({
  wishlistId: wishlistUserWishlistIdValidation,
});

const wishlistUserValidation = z.object({
  userId: wishlistUserUserIdValidation,
});

export {
  userWishlistValidation,
  wishlistUserUserIdValidation,
  wishlistUserValidation,
  wishlistUserWishlistIdValidation,
};
