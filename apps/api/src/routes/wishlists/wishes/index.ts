import { and, eq } from "drizzle-orm";
import { object } from "zod";

import {
  wishBrandValidator,
  wishDescriptionValidator,
  wishPriceValidator,
  wishTitleValidator,
  wishUrlValidator,
} from "@package/validators/wishes";

import { db } from "$lib/database";
import { wishes } from "$lib/database/schema/wishes";
import { wishlists } from "$lib/database/schema/wishlists";
import { createServer } from "$lib/server";
import { requireUser } from "$lib/server/middleware/require-auth";
import { response } from "$lib/server/response";
import {
  WishesCreateRequest,
  WishesCreateResponse,
  WishesUpdateRequest,
  WishesUpdateResponse,
  type WishesGetResponse,
  type WishesListResponse,
} from "$lib/types/routes/wishlists/wishes";

const wishesServer = createServer({});

wishesServer.get("/:wishlistId/wishes", async (c) => {
  const { wishlistId } = c.req.param();

  const wishesList = await db
    .select()
    .from(wishes)
    .where(eq(wishes.wishlistId, wishlistId))
    .orderBy(wishes.title);

  return response<WishesListResponse>(c, {
    content: {
      data: wishesList,
    },
  });
});

wishesServer.get("/:wishlistId/wishes/:wishId", async (c) => {
  const { wishlistId, wishId } = c.req.param();

  const wish = await db
    .select()
    .from(wishes)
    .where(and(eq(wishes.wishlistId, wishlistId), eq(wishes.id, wishId)))
    .get();

  if (!wish) {
    return response(c, {
      status: 404,
      content: { message: "Wish not found" },
    });
  }

  return response<WishesGetResponse>(c, {
    content: {
      data: wish,
    },
  });
});

const wishesSchema = object({
  title: wishTitleValidator,
  brand: wishBrandValidator,
  description: wishDescriptionValidator,
  price: wishPriceValidator,

  url: wishUrlValidator,
});

wishesServer.post("/:wishlistId/wishes", requireUser(), async (c) => {
  const { wishlistId } = c.req.param();
  const body = await c.req.json<WishesCreateRequest>();

  const parsedBody = wishesSchema.safeParse(body);

  if (!parsedBody.success) {
    return response(c, {
      status: 400,
      content: { errors: parsedBody.error.errors },
    });
  }

  const { data } = parsedBody;

  const wishlistExists = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.id, wishlistId))
    .get();

  if (!wishlistExists) {
    return response(c, {
      status: 404,
      content: { message: "Wishlist not found" },
    });
  }

  await Promise.all([
    db.insert(wishes).values({
      wishlistId,
      title: data.title,
      brand: data.brand,
      description: data.description,
      price: data.price,
      url: data.url,
    }),
    db
      .update(wishlists)
      .set({ wishesUpdatedAt: new Date() })
      .where(eq(wishlists.id, wishlistId)),
  ]);
  return response<WishesCreateResponse>(c, {
    status: 201,
    content: { message: "Wish created successfully" },
  });
});

wishesServer.put("/:wishlistId/wishes/:wishId", requireUser(), async (c) => {
  const { wishlistId, wishId } = c.req.param();
  const body = await c.req.json<WishesUpdateRequest>();

  const parsedBody = wishesSchema.safeParse(body);

  if (!parsedBody.success) {
    return response(c, {
      status: 400,
      content: { errors: parsedBody.error.errors },
    });
  }

  const { data } = parsedBody;

  const updateResult = await db
    .update(wishes)
    .set({
      title: data.title,
      brand: data.brand,
      description: data.description,
      price: data.price,
      url: data.url,
      updatedAt: new Date(),
    })
    .where(and(eq(wishes.wishlistId, wishlistId), eq(wishes.id, wishId)));

  if (updateResult.meta.rows_written === 0) {
    return response(c, {
      status: 404,
      content: { message: "Wish not found" },
    });
  }

  await db
    .update(wishlists)
    .set({ wishesUpdatedAt: new Date() })
    .where(eq(wishlists.id, wishlistId));

  return response<WishesUpdateResponse>(c, {
    content: { message: "Wish updated successfully" },
  });
});

wishesServer.delete("/:wishlistId/wishes/:wishId", requireUser(), async (c) => {
  const { wishlistId, wishId } = c.req.param();

  const deleteResult = await db
    .delete(wishes)
    .where(and(eq(wishes.wishlistId, wishlistId), eq(wishes.id, wishId)));

  if (deleteResult.meta.rows_written === 0) {
    return response(c, {
      status: 404,
      content: { message: "Wish not found" },
    });
  }

  await db
    .update(wishlists)
    .set({ wishesUpdatedAt: new Date() })
    .where(eq(wishlists.id, wishlistId));

  return response(c, {
    content: { message: "Wish deleted successfully" },
  });
});

export { wishesSchema, wishesServer };
