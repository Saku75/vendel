import { wishlistUsersSchema } from "$lib/database/schema/wishlist-users";
import { ApiItem } from "$lib/types/api/item";
import {
  ApiDeleteRequest,
  ApiGetRequest,
  ApiListRequest,
  ApiPostRequest,
  ApiPutRequest,
} from "$lib/types/api/request";

type WishlistUser = ApiItem<
  typeof wishlistUsersSchema.$inferSelect,
  "wishlistId"
>;

type ApiWishlistUsersRequest = ApiListRequest;
type ApiWishlistUserCreateRequest = ApiPostRequest<WishlistUser>;
type ApiWishlistUserGetRequest = ApiGetRequest;
type ApiWishlistUserUpdateRequest = ApiPutRequest<WishlistUser>;
type ApiWishlistUserDeleteRequest = ApiDeleteRequest;

export {
  ApiWishlistUserCreateRequest,
  ApiWishlistUserDeleteRequest,
  ApiWishlistUserGetRequest,
  ApiWishlistUsersRequest,
  ApiWishlistUserUpdateRequest,
};
