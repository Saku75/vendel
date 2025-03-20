import { wishesSchema } from "$lib/database/schema/wishes";
import { ApiItem } from "$lib/types/api/item";
import {
  ApiDeleteRequest,
  ApiGetRequest,
  ApiListRequest,
  ApiPostRequest,
  ApiPutRequest,
} from "$lib/types/api/request";

type Wish = ApiItem<typeof wishesSchema.$inferSelect, "wishlistId">;

type ApiWishesRequest = ApiListRequest;
type ApiWishCreateRequest = ApiPostRequest<Wish>;
type ApiWishGetRequest = ApiGetRequest;
type ApiWishUpdateRequest = ApiPutRequest<Wish>;
type ApiWishDeleteRequest = ApiDeleteRequest;

export {
  ApiWishCreateRequest,
  ApiWishDeleteRequest,
  ApiWishesRequest,
  ApiWishGetRequest,
  ApiWishUpdateRequest,
};
