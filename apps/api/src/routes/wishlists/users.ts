import { and, eq } from "drizzle-orm";

import { app } from "$lib/app";
import { database } from "$lib/database";
import { wishlistUsersSchema } from "$lib/database/schema/wishlist-users";
import { HttpStatus } from "$lib/enums/http.status";
import { validate } from "$lib/middleware/validate";
import { wishlistUserValidation } from "$lib/validations/request/wishlist-users";
import { wishlistUserIdExistsObject } from "$lib/validations/request/wishlist-users.utils";
import { wishlistIdExistsObject } from "$lib/validations/request/wishlists.utils";

import {
  ApiWishlistUserCreateResponse,
  ApiWishlistUserDeleteResponse,
  ApiWishlistUserGetResponse,
  ApiWishlistUsersResponse,
  ApiWishlistUserUpdateResponse,
} from "./users.response";

const wishlistUsersRoutes = app().basePath("/:wishlistId/users");

// Get all users from wishlist
wishlistUsersRoutes.get(
  "/",
  validate("param", wishlistIdExistsObject, HttpStatus.NotFound),
  async (c) => {
    const { wishlistId } = c.req.valid("param");

    const [wishlistUsers, totalCount] = await Promise.all([
      database()
        .select()
        .from(wishlistUsersSchema)
        .where(eq(wishlistUsersSchema.wishlistId, wishlistId)),
      database().$count(wishlistUsersSchema),
    ]);

    return c.json({
      data: {
        wishlistUsers,
        totalCount,
      },
    } satisfies ApiWishlistUsersResponse);
  },
);

// Create user on wishlist
wishlistUsersRoutes.post(
  "/",
  validate("param", wishlistIdExistsObject, HttpStatus.NotFound),
  validate("json", wishlistUserValidation),
  async (c) => {
    const { wishlistId } = c.req.valid("param");
    const data = c.req.valid("json");

    await database()
      .insert(wishlistUsersSchema)
      .values({ ...data, wishlistId });

    return c.json(
      { success: true } satisfies ApiWishlistUserCreateResponse,
      201,
    );
  },
);

// Get user on wishlist
wishlistUsersRoutes.get(
  "/:wishlistUserId",
  validate("param", wishlistUserIdExistsObject, HttpStatus.NotFound),
  async (c) => {
    const { wishlistId, wishlistUserId } = c.req.valid("param");

    const [wishlistUser] = await database()
      .select()
      .from(wishlistUsersSchema)
      .where(
        and(
          eq(wishlistUsersSchema.id, wishlistUserId),
          eq(wishlistUsersSchema.wishlistId, wishlistId),
        ),
      )
      .limit(1);

    return c.json({ data: wishlistUser } satisfies ApiWishlistUserGetResponse);
  },
);

// Update user on wishlist
wishlistUsersRoutes.put(
  "/:wishlistUserId",
  validate("param", wishlistUserIdExistsObject, HttpStatus.NotFound),
  validate("json", wishlistUserValidation),
  async (c) => {
    const { wishlistId, wishlistUserId } = c.req.valid("param");
    const data = c.req.valid("json");

    await database()
      .update(wishlistUsersSchema)
      .set({ ...data, wishlistId })
      .where(
        and(
          eq(wishlistUsersSchema.id, wishlistUserId),
          eq(wishlistUsersSchema.wishlistId, wishlistId),
        ),
      );

    return c.json({ success: true } satisfies ApiWishlistUserUpdateResponse);
  },
);

// Delete user on wishlist
wishlistUsersRoutes.delete(
  "/:wishlistUserId",
  validate("param", wishlistUserIdExistsObject, HttpStatus.NotFound),
  async (c) => {
    const { wishlistId, wishlistUserId } = c.req.valid("param");

    await database()
      .delete(wishlistUsersSchema)
      .where(
        and(
          eq(wishlistUsersSchema.id, wishlistUserId),
          eq(wishlistUsersSchema.wishlistId, wishlistId),
        ),
      );

    return c.json({ success: true } satisfies ApiWishlistUserDeleteResponse);
  },
);

export { wishlistUsersRoutes };
