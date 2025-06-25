import {
  ClientErrorStatusCode,
  ServerErrorStatusCode,
  SuccessStatusCode,
} from "hono/utils/http-status";
import { JSONValue } from "hono/utils/types";
import { ZodIssue } from "zod";

type Ok<T extends JSONValue = JSONValue> = {
  ok: true;
  status: SuccessStatusCode;
  message?: string;
  data?: T;
};

type Err = {
  ok: false;
  status: ClientErrorStatusCode | ServerErrorStatusCode;
  message?: string;
  errors?: ZodIssue[];
};

type Result<T extends JSONValue = JSONValue> = Ok<T> | Err;

export type { Err, Ok, Result };
