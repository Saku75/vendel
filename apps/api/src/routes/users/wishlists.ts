import { and, eq } from "drizzle-orm";

import { app } from "$lib/app";
import { database } from "$lib/database";
import { wishlistUsersSchema } from "$lib/database/schema/wishlist-users";
import { HttpStatus } from "$lib/enums/http.status";
import { validate } from "$lib/middleware/validate";
import { userIdExistsObject } from "$lib/validations/request/users.utils";
import { userWishlistValidation } from "$lib/validations/request/wishlist-users";
import { userWishlistIdExistsObject } from "$lib/validations/request/wishlist-users.utils";

import {
  ApiUserWishlistCreateResponse,
  ApiUserWishlistDeleteResponse,
  ApiUserWishlistGetResponse,
  ApiUserWishlistsResponse,
  ApiUserWishlistUpdateResponse,
} from "./wishlists.response";

const userWishlistsRoutes = app().basePath("/:userId/wishlists");

// Get all users from wishlist
userWishlistsRoutes.get(
  "/",
  validate("param", userIdExistsObject, HttpStatus.NotFound),
  async (c) => {
    const { userId } = c.req.valid("param");

    const [userWishlists, totalCount] = await Promise.all([
      database()
        .select()
        .from(wishlistUsersSchema)
        .where(eq(wishlistUsersSchema.userId, userId)),
      database().$count(wishlistUsersSchema),
    ]);

    return c.json({
      data: {
        userWishlists,
        totalCount,
      },
    } satisfies ApiUserWishlistsResponse);
  },
);

// Create user on wishlist
userWishlistsRoutes.post(
  "/",
  validate("param", userIdExistsObject, HttpStatus.NotFound),
  validate("json", userWishlistValidation),
  async (c) => {
    const { userId } = c.req.valid("param");
    const data = c.req.valid("json");

    await database()
      .insert(wishlistUsersSchema)
      .values({ ...data, userId });

    return c.json(
      { success: true } satisfies ApiUserWishlistCreateResponse,
      201,
    );
  },
);

// Get user on wishlist
userWishlistsRoutes.get(
  "/:wishlistUserId",
  validate("param", userWishlistIdExistsObject, HttpStatus.NotFound),
  async (c) => {
    const { userId, wishlistUserId } = c.req.valid("param");

    const [userWishlist] = await database()
      .select()
      .from(wishlistUsersSchema)
      .where(
        and(
          eq(wishlistUsersSchema.id, wishlistUserId),
          eq(wishlistUsersSchema.userId, userId),
        ),
      )
      .limit(1);

    return c.json({ data: userWishlist } satisfies ApiUserWishlistGetResponse);
  },
);

// Update user on wishlist
userWishlistsRoutes.put(
  "/:wishlistUserId",
  validate("param", userWishlistIdExistsObject, HttpStatus.NotFound),
  validate("json", userWishlistValidation),
  async (c) => {
    const { userId, wishlistUserId } = c.req.valid("param");
    const data = c.req.valid("json");

    await database()
      .update(wishlistUsersSchema)
      .set({ ...data, userId: userId })
      .where(
        and(
          eq(wishlistUsersSchema.id, wishlistUserId),
          eq(wishlistUsersSchema.userId, userId),
        ),
      );

    return c.json({ success: true } satisfies ApiUserWishlistUpdateResponse);
  },
);

// Delete user on wishlist
userWishlistsRoutes.delete(
  "/:wishlistUserId",
  validate("param", userWishlistIdExistsObject, HttpStatus.NotFound),
  async (c) => {
    const { userId, wishlistUserId } = c.req.valid("param");

    await database()
      .delete(wishlistUsersSchema)
      .where(
        and(
          eq(wishlistUsersSchema.id, wishlistUserId),
          eq(wishlistUsersSchema.userId, userId),
        ),
      );

    return c.json({ success: true } satisfies ApiUserWishlistDeleteResponse);
  },
);

export { userWishlistsRoutes };
