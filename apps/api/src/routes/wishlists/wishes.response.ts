import { wishesSchema } from "$lib/database/schema/wishes";
import {
  ApiDeleteResponse,
  ApiGetResponse,
  ApiListResponse,
  ApiPostResponse,
  ApiPutResponse,
} from "$lib/types/api/response";

type ApiWishesResponse = ApiListResponse<{
  wishes: (typeof wishesSchema.$inferSelect)[];
  totalCount: number;
}>;
type ApiWishCreateResponse = ApiPostResponse;
type ApiWishGetResponse = ApiGetResponse<typeof wishesSchema.$inferSelect>;
type ApiWishUpdateResponse = ApiPutResponse;
type ApiWishDeleteResponse = ApiDeleteResponse;

export {
  ApiWishCreateResponse,
  ApiWishDeleteResponse,
  ApiWishesResponse,
  ApiWishGetResponse,
  ApiWishUpdateResponse,
};
