import { eq } from "drizzle-orm";

import { db } from "$lib/database";
import { wishlists } from "$lib/database/schema/wishlists";
import { createServer } from "$lib/server";
import { response } from "$lib/server/response";
import type {
  WishlistsGetResponse,
  WishlistsListResponse,
} from "$lib/types/routes/wishlists";

import { wishesServer } from "./wishes";

const wishlistsServer = createServer();

wishlistsServer.get("/", async (c) => {
  const wishlistsList = await db.select().from(wishlists);

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

wishlistsServer.route("/", wishesServer);

export { wishlistsServer };
