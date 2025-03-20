import { categoriesSchema } from "$lib/database/schema/categories";
import {
  ApiDeleteResponse,
  ApiGetResponse,
  ApiListResponse,
  ApiPostResponse,
  ApiPutResponse,
} from "$lib/types/api/response";

type ApiCategoriesResponse = ApiListResponse<{
  categories: (typeof categoriesSchema.$inferSelect)[];
  totalCount: number;
}>;
type ApiCategoryCreateResponse = ApiPostResponse;
type ApiCategoryGetResponse = ApiGetResponse<
  typeof categoriesSchema.$inferSelect
>;
type ApiCategoryUpdateResponse = ApiPutResponse;
type ApiCategoryDeleteResponse = ApiDeleteResponse;

export {
  ApiCategoriesResponse,
  ApiCategoryCreateResponse,
  ApiCategoryDeleteResponse,
  ApiCategoryGetResponse,
  ApiCategoryUpdateResponse,
};
