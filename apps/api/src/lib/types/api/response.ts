import { ZodError } from "zod";

import { GenericObject } from "$lib/types/generic.object";

import { ApiPage } from "./page";

type ApiListResponse<TData extends GenericObject> = {
  data: TData;

  page?: ApiPage;
};

type ApiGetResponse<TData extends GenericObject> = {
  data: TData;
};

type ApiPostResponse =
  | {
      success: true;
    }
  | {
      success: false;

      errors: ZodError;
    };

type ApiPutResponse =
  | {
      success: true;
    }
  | {
      success: false;

      errors: ZodError;
    };

type ApiDeleteResponse = {
  success: boolean;
};

export {
  ApiDeleteResponse,
  ApiGetResponse,
  ApiListResponse,
  ApiPostResponse,
  ApiPutResponse,
};
