import { wishlistsSchema } from "$lib/database/schema/wishlists";
import { ApiItem } from "$lib/types/api/item";
import {
  ApiDeleteRequest,
  ApiGetRequest,
  ApiListRequest,
  ApiPostRequest,
  ApiPutRequest,
} from "$lib/types/api/request";

type Wishlist = ApiItem<typeof wishlistsSchema.$inferSelect>;

type ApiWishlistsRequest = ApiListRequest;
type ApiWishlistCreateRequest = ApiPostRequest<Wishlist>;
type ApiWishlistGetRequest = ApiGetRequest;
type ApiWishlistUpdateRequest = ApiPutRequest<Wishlist>;
type ApiWishlistDeleteRequest = ApiDeleteRequest;

export {
  ApiWishlistCreateRequest,
  ApiWishlistDeleteRequest,
  ApiWishlistGetRequest,
  ApiWishlistsRequest,
  ApiWishlistUpdateRequest,
};
