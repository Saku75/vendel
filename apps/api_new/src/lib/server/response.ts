import {
  ClientErrorStatusCode,
  ContentfulStatusCode,
  ContentlessStatusCode,
  ServerErrorStatusCode,
  SuccessStatusCode,
} from "hono/utils/http-status";
import { JSONValue } from "hono/utils/types";
import { ZodIssue } from "zod";

import { Result } from "$lib/types/result";

import type { ServerContext } from ".";

type SuccessResponse<T extends JSONValue | undefined = undefined> = {
  status?: Omit<SuccessStatusCode, ContentlessStatusCode>;
  content: T extends undefined
    ? { message: string }
    : { message?: string; data: T };
};

type ErrorResponse = {
  status: Omit<
    ClientErrorStatusCode | ServerErrorStatusCode,
    ContentlessStatusCode
  >;
  content:
    | {
        message: string;
        errors?: ZodIssue[];
      }
    | {
        errors: ZodIssue[];
        message?: string;
      };
};

function response<T extends JSONValue | undefined = undefined>(
  c: ServerContext,
  args: SuccessResponse<T> | ErrorResponse,
): Response {
  const status = (args.status || 200) as ContentfulStatusCode;

  const result: Result<T> = {
    status,
    ...args.content,
  };

  return c.json(result, status);
}

export { response };
