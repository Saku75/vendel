import {
  ClientErrorStatusCode,
  ContentlessStatusCode,
  ServerErrorStatusCode,
  SuccessStatusCode,
} from "hono/utils/http-status";
import { JSONValue } from "hono/utils/types";
import { ZodIssue } from "zod";

type Ok<T extends JSONValue | undefined = undefined> = {
  status: Omit<SuccessStatusCode, ContentlessStatusCode>;
} & (T extends undefined ? { message: string } : { message?: string; data: T });

type Err = {
  status: Omit<
    ClientErrorStatusCode | ServerErrorStatusCode,
    ContentlessStatusCode
  >;
} & (
  | { message: string; errors?: ZodIssue[] }
  | { errors: ZodIssue[]; message?: string }
);

type Result<T extends JSONValue | undefined = undefined> = Ok<T> | Err;

export type { Err, Ok, Result };
