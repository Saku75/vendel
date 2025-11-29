import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";
import type {
  WishesGetRequest,
  WishesListRequest,
  WishesListResponse,
} from "$lib/types/routes/wishlists/wishes";

const wishesClient = defineRoute((context) => {
  return {
    list: async (
      data: WishesListRequest,
    ): Promise<ClientResult<WishesListResponse>> => {
      return await request<WishesListResponse>(
        context,
        `wishlists/${data.wishlistId}/wishes`,
        {
          method: "GET",
        },
      );
    },
    get: async (
      data: WishesGetRequest,
    ): Promise<ClientResult<WishesListResponse>> => {
      return await request<WishesListResponse>(
        context,
        `wishlists/${data.wishlistId}/wishes/${data.wishId}`,
        {
          method: "GET",
        },
      );
    },
  };
});

export { wishesClient };
