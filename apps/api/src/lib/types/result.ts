import type {
  ClientErrorStatusCode,
  ContentlessStatusCode,
  ServerErrorStatusCode,
  SuccessStatusCode,
} from "hono/utils/http-status";
import type { JSONValue } from "hono/utils/types";
import type { z } from "zod/mini";

type Ok<T extends JSONValue | undefined = undefined> = {
  status: Omit<SuccessStatusCode, ContentlessStatusCode>;
} & (T extends undefined ? { message: string } : { message?: string; data: T });

type Err = {
  status: Omit<
    ClientErrorStatusCode | ServerErrorStatusCode,
    ContentlessStatusCode
  >;
} & (
  | { message: string; errors?: z.core.$ZodIssue[] }
  | { errors: z.core.$ZodIssue[]; message?: string }
);

type Result<T extends JSONValue | undefined = undefined> = Ok<T> | Err;

export type { Err, Ok, Result };
