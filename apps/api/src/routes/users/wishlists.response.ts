import { wishlistUsersSchema } from "$lib/database/schema/wishlist-users";
import {
  ApiDeleteResponse,
  ApiGetResponse,
  ApiListResponse,
  ApiPostResponse,
  ApiPutResponse,
} from "$lib/types/api/response";

type ApiUserWishlistsResponse = ApiListResponse<{
  userWishlists: (typeof wishlistUsersSchema.$inferSelect)[];
  totalCount: number;
}>;
type ApiUserWishlistCreateResponse = ApiPostResponse;
type ApiUserWishlistGetResponse = ApiGetResponse<
  typeof wishlistUsersSchema.$inferSelect
>;
type ApiUserWishlistUpdateResponse = ApiPutResponse;
type ApiUserWishlistDeleteResponse = ApiDeleteResponse;

export {
  ApiUserWishlistCreateResponse,
  ApiUserWishlistDeleteResponse,
  ApiUserWishlistGetResponse,
  ApiUserWishlistsResponse,
  ApiUserWishlistUpdateResponse,
};
