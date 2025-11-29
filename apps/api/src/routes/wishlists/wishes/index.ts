import { and, eq } from "drizzle-orm";

import { db } from "$lib/database";
import { wishes } from "$lib/database/schema/wishes";
import { createServer } from "$lib/server";
import { response } from "$lib/server/response";
import type {
  WishesGetResponse,
  WishesListResponse,
} from "$lib/types/routes/wishlists/wishes";

const wishesServer = createServer({});

wishesServer.get("/:wishlistId/wishes", async (c) => {
  const { wishlistId } = c.req.param();

  const wishesList = await db
    .select()
    .from(wishes)
    .where(eq(wishes.wishlistId, wishlistId));

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

export { wishesServer };
