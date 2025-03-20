import { categoriesSchema } from "$lib/database/schema/categories";
import { ApiItem } from "$lib/types/api/item";
import {
  ApiDeleteRequest,
  ApiGetRequest,
  ApiListRequest,
  ApiPostRequest,
  ApiPutRequest,
} from "$lib/types/api/request";

type Category = ApiItem<typeof categoriesSchema.$inferSelect>;

type ApiCategoriesRequest = ApiListRequest;
type ApiCategoryCreateRequest = ApiPostRequest<Category>;
type ApiCategoryGetRequest = ApiGetRequest;
type ApiCategoryUpdateRequest = ApiPutRequest<Category>;
type ApiCategoryDeleteRequest = ApiDeleteRequest;

export {
  ApiCategoriesRequest,
  ApiCategoryCreateRequest,
  ApiCategoryDeleteRequest,
  ApiCategoryGetRequest,
  ApiCategoryUpdateRequest,
};
