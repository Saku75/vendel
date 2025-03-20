import { wishlistsSchema } from "$lib/database/schema/wishlists";
import {
  ApiDeleteResponse,
  ApiGetResponse,
  ApiListResponse,
  ApiPostResponse,
  ApiPutResponse,
} from "$lib/types/api/response";

type ApiWishlistsResponse = ApiListResponse<{
  wishlists: (typeof wishlistsSchema.$inferSelect)[];
  totalCount: number;
}>;
type ApiWishlistCreateResponse = ApiPostResponse;
type ApiWishlistGetResponse = ApiGetResponse<
  typeof wishlistsSchema.$inferSelect
>;
type ApiWishlistUpdateResponse = ApiPutResponse;
type ApiWishlistDeleteResponse = ApiDeleteResponse;

export {
  ApiWishlistCreateResponse,
  ApiWishlistDeleteResponse,
  ApiWishlistGetResponse,
  ApiWishlistsResponse,
  ApiWishlistUpdateResponse,
};
