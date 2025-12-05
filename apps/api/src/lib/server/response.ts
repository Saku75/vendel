import type {
  ClientErrorStatusCode,
  ContentfulStatusCode,
  ContentlessStatusCode,
  ServerErrorStatusCode,
  SuccessStatusCode,
} from "hono/utils/http-status";
import type { JSONValue } from "hono/utils/types";
import { z } from "zod/mini";

import type { Result } from "$lib/types/result";

import type { ServerContext } from ".";

type SuccessResponse<T extends JSONValue | undefined = undefined> = {
  status?: Exclude<SuccessStatusCode, ContentlessStatusCode>;
  content: T extends undefined
    ? { message: string }
    : { message?: string; data: T };
};

type ErrorResponse = {
  status: Exclude<
    ClientErrorStatusCode | ServerErrorStatusCode,
    ContentlessStatusCode
  >;
  content:
    | {
        message: string;
        errors?: z.core.$ZodIssue[];
      }
    | {
        errors: z.core.$ZodIssue[];
        message?: string;
      };
};

type ContentlessResponse = {
  status: ContentlessStatusCode;
};

function response<T extends JSONValue | undefined = undefined>(
  c: ServerContext,
  args: SuccessResponse<T> | ErrorResponse | ContentlessResponse,
): Response {
  if (!("content" in args)) return c.body(null, args.status);

  const status = (args.status || 200) as ContentfulStatusCode;

  const result: Result<T> = {
    status,
    ...args.content,
  };

  return c.json(result, status);
}

export { response };
