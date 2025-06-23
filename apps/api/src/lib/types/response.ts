import {
  ClientErrorStatusCode,
  InfoStatusCode,
  RedirectStatusCode,
  ServerErrorStatusCode,
  SuccessStatusCode,
} from "hono/utils/http-status";
import { JSONValue } from "hono/utils/types";
import { ZodIssue } from "zod";

type ApiResponseWithInfo = {
  status: Exclude<InfoStatusCode, 101>;
  message?: string;
};

type ApiResponseWithSuccess<T extends JSONValue = JSONValue> = {
  status: Exclude<SuccessStatusCode, 204 | 205>;
  message?: string;
  data?: T;
};

type ApiResponseWithRedirect = {
  status: Exclude<RedirectStatusCode, 304>;
  message?: string;
};

type ApiResponseWithClientError = {
  status: ClientErrorStatusCode;
  message?: string;
  errors?: ZodIssue[];
};

type ApiResponseWithServerError = {
  status: ServerErrorStatusCode;
  message?: string;
};

type ApiResponse<T extends JSONValue = JSONValue> =
  | ApiResponseWithInfo
  | ApiResponseWithSuccess<T>
  | ApiResponseWithRedirect
  | ApiResponseWithClientError
  | ApiResponseWithServerError;

export type {
  ApiResponse,
  ApiResponseWithClientError,
  ApiResponseWithInfo,
  ApiResponseWithRedirect,
  ApiResponseWithServerError,
  ApiResponseWithSuccess,
};
