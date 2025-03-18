import { and, eq } from "drizzle-orm";

import { app } from "$lib/app";
import { database } from "$lib/database";
import { wishlistUsersSchema } from "$lib/database/schema/wishlist-users";
import { wishlistUserExists } from "$lib/validations/data/wishlist-user.exists";
import { wishlistExists } from "$lib/validations/data/wishlist.exists";

const wishlistUsersRoutes = app().basePath("/:wishlistId/users");

// Get all users from wishlist
wishlistUsersRoutes.get("/", async (c) => {
  const { wishlistId } = c.req.param();

  if (!(await wishlistExists(wishlistId))) return c.notFound();

  const wishlistUsers = await database()
    .select()
    .from(wishlistUsersSchema)
    .where(eq(wishlistUsersSchema.wishlistId, wishlistId));

  return c.json(wishlistUsers);
});

// Create user on wishlist
wishlistUsersRoutes.post("/", async (c) => {
  const { wishlistId } = c.req.param();

  if (!(await wishlistExists(wishlistId))) return c.notFound();

  const data = (await c.req.json()) as {
    userId: string;
  };

  await database()
    .insert(wishlistUsersSchema)
    .values({
      wishlistId,
      ...data,
    });

  return c.body(null, 201);
});

// Get user on wishlist
wishlistUsersRoutes.get("/:wishlistUserId", async (c) => {
  const { wishlistId, wishlistUserId } = c.req.param();

  if (
    !(await wishlistExists(wishlistId)) &&
    !(await wishlistUserExists(wishlistUserId))
  )
    return c.notFound();

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

  return c.json(wishlistUser);
});

// Update user on wishlist
wishlistUsersRoutes.put("/:wishlistUserId", async (c) => {
  const { wishlistId, wishlistUserId } = c.req.param();

  if (
    !(await wishlistExists(wishlistId)) &&
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
        eq(wishlistUsersSchema.wishlistId, wishlistId),
      ),
    );

  return c.body(null, 204);
});

// Delete user on wishlist
wishlistUsersRoutes.delete("/:wishlistUserId", async (c) => {
  const { wishlistId, wishlistUserId } = c.req.param();

  if (
    !(await wishlistExists(wishlistId)) &&
    !(await wishlistUserExists(wishlistUserId))
  )
    return c.notFound();

  await database()
    .delete(wishlistUsersSchema)
    .where(
      and(
        eq(wishlistUsersSchema.id, wishlistUserId),
        eq(wishlistUsersSchema.wishlistId, wishlistId),
      ),
    );

  return c.body(null, 204);
});

export { wishlistUsersRoutes };
