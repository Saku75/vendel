import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";
import type { WishesListResponse } from "$lib/types/routes/wishlists/wishes";

const wishesClient = defineRoute((context) => {
  return {
    list: async (
      wishlistId: string,
    ): Promise<ClientResult<WishesListResponse>> => {
      return await request<WishesListResponse>(
        context,
        `wishlists/${wishlistId}/wishes`,
        {
          method: "GET",
        },
      );
    },
    get: async (
      wishlistId: string,
      wishId: string,
    ): Promise<ClientResult<WishesListResponse>> => {
      return await request<WishesListResponse>(
        context,
        `wishlists/${wishlistId}/wishes/${wishId}`,
        {
          method: "GET",
        },
      );
    },
  };
});

export { wishesClient };
