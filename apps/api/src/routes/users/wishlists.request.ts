import { wishlistUsersSchema } from "$lib/database/schema/wishlist-users";
import { ApiItem } from "$lib/types/api/item";
import {
  ApiDeleteRequest,
  ApiGetRequest,
  ApiListRequest,
  ApiPostRequest,
  ApiPutRequest,
} from "$lib/types/api/request";

type UserWishlist = ApiItem<typeof wishlistUsersSchema.$inferSelect, "userId">;

type ApiUserWishlistsRequest = ApiListRequest;
type ApiUserWishlistCreateRequest = ApiPostRequest<UserWishlist>;
type ApiUserWishlistGetRequest = ApiGetRequest;
type ApiUserWishlistUpdateRequest = ApiPutRequest<UserWishlist>;
type ApiUserWishlistDeleteRequest = ApiDeleteRequest;

export {
  ApiUserWishlistCreateRequest,
  ApiUserWishlistDeleteRequest,
  ApiUserWishlistGetRequest,
  ApiUserWishlistsRequest,
  ApiUserWishlistUpdateRequest,
};
