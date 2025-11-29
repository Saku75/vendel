import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";
import type {
  WishesCreateRequest,
  WishesCreateResponse,
  WishesDeleteResponse,
  WishesGetResponse,
  WishesListResponse,
  WishesUpdateRequest,
  WishesUpdateResponse,
} from "$lib/types/routes/wishlists/wishes";

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
    ): Promise<ClientResult<WishesGetResponse>> => {
      return await request<WishesGetResponse>(
        context,
        `wishlists/${wishlistId}/wishes/${wishId}`,
        {
          method: "GET",
        },
      );
    },
    create: async (
      wishlistId: string,
      data: WishesCreateRequest,
    ): Promise<ClientResult<WishesCreateResponse>> => {
      return await request<WishesCreateResponse>(
        context,
        `wishlists/${wishlistId}/wishes`,
        {
          method: "POST",
          json: data,
        },
      );
    },
    update: async (
      wishlistId: string,
      wishId: string,
      data: WishesUpdateRequest,
    ): Promise<ClientResult<WishesUpdateResponse>> => {
      return await request<WishesUpdateResponse>(
        context,
        `wishlists/${wishlistId}/wishes/${wishId}`,
        {
          method: "PUT",
          json: data,
        },
      );
    },
    delete: async (
      wishlistId: string,
      wishId: string,
    ): Promise<ClientResult<WishesDeleteResponse>> => {
      return await request<WishesDeleteResponse>(
        context,
        `wishlists/${wishlistId}/wishes/${wishId}`,
        {
          method: "DELETE",
        },
      );
    },
  };
});

export { wishesClient };
