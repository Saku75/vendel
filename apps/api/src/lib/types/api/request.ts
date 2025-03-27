import { GenericObject } from "$lib/types/generic.object";

type ApiListRequest = {};

type ApiGetRequest = {};

type ApiPostRequest<TData extends GenericObject = never> = TData;

type ApiPutRequest<TData extends GenericObject = never> = TData;

type ApiDeleteRequest = {};

export {
  ApiDeleteRequest,
  ApiGetRequest,
  ApiListRequest,
  ApiPostRequest,
  ApiPutRequest,
};
