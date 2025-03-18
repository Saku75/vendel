import { and, eq } from "drizzle-orm";

import { app } from "$lib/app";
import { database } from "$lib/database";
import { wishlistUsersSchema } from "$lib/database/schema/wishlist-users";
import { userExists } from "$lib/validations/data/user.exists";
import { wishlistUserExists } from "$lib/validations/data/wishlist-user.exists";

const userWishlistsRoutes = app().basePath("/:userId/wishlists");

// Get all users from wishlist
userWishlistsRoutes.get("/", async (c) => {
  const { userId } = c.req.param();

  if (!(await userExists(userId))) return c.notFound();

  const wishlistUsers = await database()
    .select()
    .from(wishlistUsersSchema)
    .where(eq(wishlistUsersSchema.userId, userId));

  return c.json(wishlistUsers);
});

// Create user on wishlist
userWishlistsRoutes.post("/", async (c) => {
  const { userId } = c.req.param();

  if (!(await userExists(userId))) return c.notFound();

  const data = (await c.req.json()) as {
    wishlistId: string;
  };

  await database()
    .insert(wishlistUsersSchema)
    .values({
      userId,
      ...data,
    });

  return c.body(null, 201);
});

// Get user on wishlist
userWishlistsRoutes.get("/:wishlistUserId", async (c) => {
  const { userId, wishlistUserId } = c.req.param();

  if (
    !(await userExists(userId)) &&
    !(await wishlistUserExists(wishlistUserId))
  )
    return c.notFound();

  const [wishlistUser] = await database()
    .select()
    .from(wishlistUsersSchema)
    .where(
      and(
        eq(wishlistUsersSchema.id, wishlistUserId),
        eq(wishlistUsersSchema.userId, userId),
      ),
    )
    .limit(1);

  return c.json(wishlistUser);
});

// Update user on wishlist
userWishlistsRoutes.put("/:wishlistUserId", async (c) => {
  const { userId, wishlistUserId } = c.req.param();

  if (
    !(await userExists(userId)) &&
    !(await wishlistUserExists(wishlistUserId))
  )
    return c.notFound();

  const data = (await c.req.json()) as {
    userId: string;
  };

  await database()
    .update(wishlistUsersSchema)
    .set(data)
    .where(
      and(
        eq(wishlistUsersSchema.id, wishlistUserId),
        eq(wishlistUsersSchema.userId, userId),
      ),
    );

  return c.body(null, 204);
});

// Delete user on wishlist
userWishlistsRoutes.delete("/:wishlistUserId", async (c) => {
  const { userId, wishlistUserId } = c.req.param();

  if (
    !(await userExists(userId)) &&
    !(await wishlistUserExists(wishlistUserId))
  )
    return c.notFound();

  await database()
    .delete(wishlistUsersSchema)
    .where(
      and(
        eq(wishlistUsersSchema.id, wishlistUserId),
        eq(wishlistUsersSchema.userId, userId),
      ),
    );

  return c.body(null, 204);
});

export { userWishlistsRoutes };
