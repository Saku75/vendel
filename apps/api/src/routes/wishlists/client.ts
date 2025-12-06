import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";
import type {
  WishlistsCreateRequest,
  WishlistsCreateResponse,
  WishlistsDeleteResponse,
  WishlistsGetResponse,
  WishlistsListResponse,
  WishlistsUpdateRequest,
  WishlistsUpdateResponse,
} from "$lib/types";

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
      wishlistId: string,
    ): Promise<ClientResult<WishlistsGetResponse>> => {
      return await request<WishlistsGetResponse>(
        context,
        `wishlists/${wishlistId}`,
        {
          method: "GET",
        },
      );
    },
    create: async (
      data: WishlistsCreateRequest,
    ): Promise<ClientResult<WishlistsCreateResponse>> => {
      return await request<WishlistsCreateResponse>(context, `wishlists`, {
        method: "POST",
        json: data,
      });
    },
    update: async (
      wishlistId: string,
      data: WishlistsUpdateRequest,
    ): Promise<ClientResult<WishlistsUpdateResponse>> => {
      return await request<WishlistsUpdateResponse>(
        context,
        `wishlists/${wishlistId}`,
        {
          method: "PUT",
          json: data,
        },
      );
    },
    delete: async (
      wishlistId: string,
    ): Promise<ClientResult<WishlistsDeleteResponse>> => {
      return await request<WishlistsDeleteResponse>(
        context,
        `wishlists/${wishlistId}`,
        {
          method: "DELETE",
        },
      );
    },
  };
});

export { wishlistsClient };
