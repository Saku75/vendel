import { GenericObject } from "$lib/types/generic.object";

import { ApiPage } from "./page";

type ApiListRequest<TFilters extends GenericObject = never> = {
  filters?: TFilters;

  page?: ApiPage;
};

type ApiGetRequest = {};

type ApiPostRequest<TData extends GenericObject = never> = {
  data: TData;
};

type ApiPutRequest<TData extends GenericObject = never> = {
  data: TData;
};

type ApiDeleteRequest = {};

export {
  ApiDeleteRequest,
  ApiGetRequest,
  ApiListRequest,
  ApiPostRequest,
  ApiPutRequest,
};
