import { eq } from "drizzle-orm";

import { app } from "$lib/app";
import { database } from "$lib/database";
import { wishlistsSchema } from "$lib/database/schema/wishlists";
import { wishlistExists } from "$lib/validations/data/wishlist.exists";

import { wishlistUsersRoutes } from "./users";
import { wishlistWishesRoutes } from "./wishes";

const wishlistsRoutes = app();

// Get all wishlists
wishlistsRoutes.get("/", async (c) => {
  const wishlists = await database().select().from(wishlistsSchema);

  return c.json(wishlists);
});

// Create wishlist
wishlistsRoutes.post("/", async (c) => {
  const data = (await c.req.json()) as {
    name: string;
    date?: string;
  };

  await database().insert(wishlistsSchema).values(data);

  return c.body(null, 201);
});

// Get wishlist
wishlistsRoutes.get("/:wishlistId", async (c) => {
  const { wishlistId } = c.req.param();

  if (!(await wishlistExists(wishlistId))) return c.notFound();

  const [wishlist] = await database()
    .select()
    .from(wishlistsSchema)
    .where(eq(wishlistsSchema.id, wishlistId))
    .limit(1);

  return c.json(wishlist);
});

// Update wishlist
wishlistsRoutes.put("/:wishlistId", async (c) => {
  const { wishlistId } = c.req.param();

  if (!(await wishlistExists(wishlistId))) return c.notFound();

  const data = (await c.req.json()) as {
    name: string;
    date?: string;
  };

  await database()
    .update(wishlistsSchema)
    .set(data)
    .where(eq(wishlistsSchema.id, wishlistId));

  return c.body(null, 204);
});

// Delete wishlist
wishlistsRoutes.delete("/:wishlistId", async (c) => {
  const { wishlistId } = c.req.param();

  if (!(await wishlistExists(wishlistId))) return c.notFound();

  await database()
    .delete(wishlistsSchema)
    .where(eq(wishlistsSchema.id, wishlistId));

  return c.body(null, 204);
});

wishlistsRoutes.route("/", wishlistUsersRoutes);
wishlistsRoutes.route("/", wishlistWishesRoutes);

export { wishlistsRoutes };
