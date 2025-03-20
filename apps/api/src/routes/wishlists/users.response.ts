import { wishlistUsersSchema } from "$lib/database/schema/wishlist-users";
import {
  ApiDeleteResponse,
  ApiGetResponse,
  ApiListResponse,
  ApiPostResponse,
  ApiPutResponse,
} from "$lib/types/api/response";

type ApiWishlistUsersResponse = ApiListResponse<{
  wishlistUsers: (typeof wishlistUsersSchema.$inferSelect)[];
  totalCount: number;
}>;
type ApiWishlistUserCreateResponse = ApiPostResponse;
type ApiWishlistUserGetResponse = ApiGetResponse<
  typeof wishlistUsersSchema.$inferSelect
>;
type ApiWishlistUserUpdateResponse = ApiPutResponse;
type ApiWishlistUserDeleteResponse = ApiDeleteResponse;

export {
  ApiWishlistUserCreateResponse,
  ApiWishlistUserDeleteResponse,
  ApiWishlistUserGetResponse,
  ApiWishlistUsersResponse,
  ApiWishlistUserUpdateResponse,
};
