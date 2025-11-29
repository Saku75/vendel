import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";
import type {
  WishlistsGetRequest,
  WishlistsListResponse,
} from "$lib/types/routes/wishlists";

import { wishesClient } from "./wishes/client";

const wishlistsClient = defineRoute((context) => {
  return {
    wishes: wishesClient(context),
    list: async (): Promise<ClientResult<WishlistsListResponse>> => {
      return await request<WishlistsListResponse>(context, `wishlists`, {
        method: "GET",
      });
    },
    get: async (
      data: WishlistsGetRequest,
    ): Promise<ClientResult<WishlistsGetRequest>> => {
      return await request<WishlistsGetRequest>(
        context,
        `wishlists/${data.wishlistId}`,
        {
          method: "GET",
        },
      );
    },
  };
});

export { wishlistsClient };
