import { and, eq } from "drizzle-orm";

import { app } from "$lib/app";
import { database } from "$lib/database";
import { wishesSchema } from "$lib/database/schema/wishes";
import { wishExists } from "$lib/validations/data/wish.exists";
import { wishlistExists } from "$lib/validations/data/wishlist.exists";

const wishlistWishesRoutes = app().basePath("/:wishlistId/wishes");

// Get all wishes from wishlist
wishlistWishesRoutes.get("/", async (c) => {
  const { wishlistId } = c.req.param();

  if (!(await wishlistExists(wishlistId))) return c.notFound();

  const wishes = await database()
    .select()
    .from(wishesSchema)
    .where(eq(wishesSchema.wishlistId, wishlistId));

  return c.json(wishes);
});

// Create wish on wishlist
wishlistWishesRoutes.post("/", async (c) => {
  const { wishlistId } = c.req.param();

  if (!(await wishlistExists(wishlistId))) return c.notFound();

  const data = (await c.req.json()) as {
    categoryId: string;
    title: string;
    brand?: string;
    description?: string;
    price?: number;
    link?: string;
  };

  await database()
    .insert(wishesSchema)
    .values({
      wishlistId,
      ...data,
    });

  return c.body(null, 201);
});

// Get wish on wishlist
wishlistWishesRoutes.get("/:wishId", async (c) => {
  const { wishlistId, wishId } = c.req.param();

  if (!(await wishlistExists(wishlistId)) && !(await wishExists(wishId)))
    return c.notFound();

  const [wish] = await database()
    .select()
    .from(wishesSchema)
    .where(
      and(eq(wishesSchema.id, wishId), eq(wishesSchema.wishlistId, wishlistId)),
    )
    .limit(1);

  return c.json(wish);
});

// Update wish on wishlist
wishlistWishesRoutes.put("/:wishId", async (c) => {
  const { wishlistId, wishId } = c.req.param();

  if (!(await wishlistExists(wishlistId)) && !(await wishExists(wishId)))
    return c.notFound();

  const data = (await c.req.json()) as {
    categoryId: string;
    title: string;
    brand?: string;
    description?: string;
    price?: number;
    link?: string;
  };

  await database()
    .update(wishesSchema)
    .set(data)
    .where(
      and(eq(wishesSchema.id, wishId), eq(wishesSchema.wishlistId, wishlistId)),
    );

  return c.body(null, 204);
});

// Delete wish on wishlist
wishlistWishesRoutes.delete("/:wishId", async (c) => {
  const { wishlistId, wishId } = c.req.param();

  if (!(await wishlistExists(wishlistId)) && !(await wishExists(wishId)))
    return c.notFound();

  await database()
    .delete(wishesSchema)
    .where(
      and(eq(wishesSchema.id, wishId), eq(wishesSchema.wishlistId, wishlistId)),
    );

  return c.body(null, 204);
});

export { wishlistWishesRoutes };
