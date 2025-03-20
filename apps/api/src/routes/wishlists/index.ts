import { eq } from "drizzle-orm";

import { app } from "$lib/app";
import { database } from "$lib/database";
import { wishlistsSchema } from "$lib/database/schema/wishlists";
import { HttpStatus } from "$lib/enums/http.status";
import { validate } from "$lib/middleware/validate";
import { wishlistValidation } from "$lib/validations/request/wishlists";
import { wishlistIdExistsObject } from "$lib/validations/request/wishlists.utils";

import {
  ApiWishlistCreateResponse,
  ApiWishlistDeleteResponse,
  ApiWishlistGetResponse,
  ApiWishlistsResponse,
  ApiWishlistUpdateResponse,
} from "./index.response";
import { wishlistUsersRoutes } from "./users";
import { wishlistWishesRoutes } from "./wishes";

const wishlistsRoutes = app();

// Get all wishlists
wishlistsRoutes.get("/", async (c) => {
  const [wishlists, totalCount] = await Promise.all([
    database().select().from(wishlistsSchema),
    database().$count(wishlistsSchema),
  ]);

  return c.json({
    data: {
      wishlists,
      totalCount,
    },
  } satisfies ApiWishlistsResponse);
});

// Create wishlist
wishlistsRoutes.post("/", validate("json", wishlistValidation), async (c) => {
  const data = c.req.valid("json");

  await database().insert(wishlistsSchema).values(data);

  return c.json({ success: true } satisfies ApiWishlistCreateResponse, 201);
});

// Get wishlist
wishlistsRoutes.get(
  "/:wishlistId",
  validate("param", wishlistIdExistsObject, HttpStatus.NotFound),
  async (c) => {
    const { wishlistId } = c.req.valid("param");

    const [wishlist] = await database()
      .select()
      .from(wishlistsSchema)
      .where(eq(wishlistsSchema.id, wishlistId))
      .limit(1);

    return c.json({ data: wishlist } satisfies ApiWishlistGetResponse);
  },
);

// Update wishlist
wishlistsRoutes.put(
  "/:wishlistId",
  validate("param", wishlistIdExistsObject, HttpStatus.NotFound),
  validate("json", wishlistValidation),
  async (c) => {
    const { wishlistId } = c.req.valid("param");
    const data = c.req.valid("json");

    await database()
      .update(wishlistsSchema)
      .set(data)
      .where(eq(wishlistsSchema.id, wishlistId));

    return c.json({ success: true } satisfies ApiWishlistUpdateResponse);
  },
);

// Delete wishlist
wishlistsRoutes.delete(
  "/:wishlistId",
  validate("param", wishlistIdExistsObject, HttpStatus.NotFound),
  async (c) => {
    const { wishlistId } = c.req.valid("param");

    await database()
      .delete(wishlistsSchema)
      .where(eq(wishlistsSchema.id, wishlistId));

    return c.json({ success: true } satisfies ApiWishlistDeleteResponse);
  },
);

wishlistsRoutes.route("/", wishlistUsersRoutes);
wishlistsRoutes.route("/", wishlistWishesRoutes);

export { wishlistsRoutes };
