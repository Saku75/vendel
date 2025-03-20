import { and, eq } from "drizzle-orm";

import { app } from "$lib/app";
import { database } from "$lib/database";
import { wishesSchema } from "$lib/database/schema/wishes";
import { HttpStatus } from "$lib/enums/http.status";
import { validate } from "$lib/middleware/validate";
import { wishValidation } from "$lib/validations/request/wishes";
import { wishIdExistsObject } from "$lib/validations/request/wishes.utils";
import { wishlistIdExistsObject } from "$lib/validations/request/wishlists.utils";

import {
  ApiWishCreateResponse,
  ApiWishDeleteResponse,
  ApiWishesResponse,
  ApiWishGetResponse,
  ApiWishUpdateResponse,
} from "./wishes.response";

const wishlistWishesRoutes = app().basePath("/:wishlistId/wishes");

// Get all wishes from wishlist
wishlistWishesRoutes.get(
  "/",
  validate("param", wishlistIdExistsObject, HttpStatus.NotFound),
  async (c) => {
    const { wishlistId } = c.req.valid("param");

    const [wishes, totalCount] = await Promise.all([
      database()
        .select()
        .from(wishesSchema)
        .where(eq(wishesSchema.wishlistId, wishlistId)),
      database().$count(wishesSchema),
    ]);

    return c.json({
      data: {
        wishes,
        totalCount,
      },
    } satisfies ApiWishesResponse);
  },
);

// Create wish on wishlist
wishlistWishesRoutes.post(
  "/",
  validate("param", wishlistIdExistsObject, HttpStatus.NotFound),
  validate("json", wishValidation),
  async (c) => {
    const { wishlistId } = c.req.valid("param");
    const data = c.req.valid("json");

    await database()
      .insert(wishesSchema)
      .values({
        wishlistId,
        ...data,
      });

    return c.json({ success: true } satisfies ApiWishCreateResponse, 201);
  },
);

// Get wish on wishlist
wishlistWishesRoutes.get(
  "/:wishId",
  validate("param", wishIdExistsObject, HttpStatus.NotFound),
  async (c) => {
    const { wishlistId, wishId } = c.req.valid("param");

    const [wish] = await database()
      .select()
      .from(wishesSchema)
      .where(
        and(
          eq(wishesSchema.id, wishId),
          eq(wishesSchema.wishlistId, wishlistId),
        ),
      )
      .limit(1);

    return c.json({ data: wish } satisfies ApiWishGetResponse);
  },
);

// Update wish on wishlist
wishlistWishesRoutes.put(
  "/:wishId",
  validate("param", wishIdExistsObject, HttpStatus.NotFound),
  validate("json", wishValidation),
  async (c) => {
    const { wishlistId, wishId } = c.req.valid("param");
    const data = c.req.valid("json");

    await database()
      .update(wishesSchema)
      .set(data)
      .where(
        and(
          eq(wishesSchema.id, wishId),
          eq(wishesSchema.wishlistId, wishlistId),
        ),
      );

    return c.json({ success: true } satisfies ApiWishUpdateResponse);
  },
);

// Delete wish on wishlist
wishlistWishesRoutes.delete(
  "/:wishId",
  validate("param", wishIdExistsObject, HttpStatus.NotFound),
  async (c) => {
    const { wishlistId, wishId } = c.req.valid("param");

    await database()
      .delete(wishesSchema)
      .where(
        and(
          eq(wishesSchema.id, wishId),
          eq(wishesSchema.wishlistId, wishlistId),
        ),
      );

    return c.json({ success: true } satisfies ApiWishDeleteResponse);
  },
);

export { wishlistWishesRoutes };
