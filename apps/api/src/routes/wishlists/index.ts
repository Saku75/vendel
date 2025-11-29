import { eq } from "drizzle-orm";
import { object } from "zod";

import {
  wishlistDescriptionValidator,
  wishlistNameValidator,
} from "@package/validators/wishlist";

import { db } from "$lib/database";
import { wishlists } from "$lib/database/schema/wishlists";
import { createServer } from "$lib/server";
import { requireAdmin } from "$lib/server/middleware/require-auth";
import { response } from "$lib/server/response";
import type {
  WishlistsCreateRequest,
  WishlistsCreateResponse,
  WishlistsGetResponse,
  WishlistsListResponse,
  WishlistsUpdateRequest,
  WishlistsUpdateResponse,
} from "$lib/types/routes/wishlists";

import { wishesServer } from "./wishes";

const wishlistsServer = createServer();

wishlistsServer.get("/", async (c) => {
  const wishlistsList = await db
    .select()
    .from(wishlists)
    .orderBy(wishlists.name);

  return response<WishlistsListResponse>(c, {
    content: {
      data: wishlistsList,
    },
  });
});

wishlistsServer.get("/:wishlistId", async (c) => {
  const { wishlistId } = c.req.param();

  const wishlist = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.id, wishlistId))
    .get();

  if (!wishlist) {
    return response(c, {
      status: 404,
      content: { message: "Wishlist not found" },
    });
  }

  return response<WishlistsGetResponse>(c, {
    content: {
      data: wishlist,
    },
  });
});

const wishlistsSchema = object({
  name: wishlistNameValidator,
  description: wishlistDescriptionValidator,
});

wishlistsServer.post("/", requireAdmin(), async (c) => {
  const body = await c.req.json<WishlistsCreateRequest>();

  const parsedBody = wishlistsSchema.safeParse(body);

  if (!parsedBody.success) {
    return response(c, {
      status: 400,
      content: { errors: parsedBody.error.errors },
    });
  }

  const { data } = parsedBody;

  await db.insert(wishlists).values({
    name: data.name,
    description: data.description,
  });

  return response<WishlistsCreateResponse>(c, {
    status: 201,
    content: { message: "Wishlist created" },
  });
});

wishlistsServer.put("/:wishlistId", requireAdmin(), async (c) => {
  const { wishlistId } = c.req.param();
  const body = await c.req.json<WishlistsUpdateRequest>();

  const parsedBody = wishlistsSchema.safeParse(body);

  if (!parsedBody.success) {
    return response(c, {
      status: 400,
      content: { errors: parsedBody.error.errors },
    });
  }

  const { data } = parsedBody;

  const updateResult = await db
    .update(wishlists)
    .set({
      name: data.name,
      description: data.description,
    })
    .where(eq(wishlists.id, wishlistId));

  if (updateResult.meta.rows_written === 0) {
    return response(c, {
      status: 404,
      content: { message: "Wishlist not found" },
    });
  }

  return response<WishlistsUpdateResponse>(c, {
    content: { message: "Wishlist updated" },
  });
});

wishlistsServer.delete("/:wishlistId", requireAdmin(), async (c) => {
  const { wishlistId } = c.req.param();

  const deleteResult = await db
    .delete(wishlists)
    .where(eq(wishlists.id, wishlistId));

  if (deleteResult.meta.rows_written === 0) {
    return response(c, {
      status: 404,
      content: { message: "Wishlist not found" },
    });
  }

  return response(c, {
    content: { message: "Wishlist deleted" },
  });
});

wishlistsServer.route("/", wishesServer);

export { wishlistsSchema, wishlistsServer };
