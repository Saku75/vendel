import type { JSONValue } from "hono/utils/types";

import type { Result } from "$lib/types/result";

import type { ClientResult, RequestOptions, RouteContext } from "./types";

function toClientResult<T extends JSONValue | undefined = undefined>(
  result: Result<T>,
): ClientResult<T> {
  const status = result.status as number;
  const isSuccess = status >= 200 && status < 300;

  if (isSuccess) {
    return { ...result, ok: true } as ClientResult<T>;
  } else {
    return { ...result, ok: false } as ClientResult<T>;
  }
}

async function request<T extends JSONValue | undefined = undefined>(
  context: RouteContext,
  path: string,
  options: RequestOptions = {},
): Promise<ClientResult<T>> {
  try {
    const response = await context.fetch(path, {
      method: options.method || "GET",
      json: options.json,
      searchParams: options.searchParams,
      headers: options.headers,
    });

    // Try to parse JSON response
    try {
      const result = await response.json<Result<T>>();
      return toClientResult(result);
    } catch {
      // If JSON parsing fails but response was successful
      if (response.ok) {
        return {
          ok: false,
          status: 500,
          message: "Invalid JSON response",
        };
      }

      // If response was not successful
      return {
        ok: false,
        status: (response.status >= 400 && response.status < 500
          ? response.status
          : 500) as 500,
        message: response.statusText || "Request failed",
      };
    }
  } catch (error) {
    return {
      ok: false,
      status: 500,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

function defineRoute<TFn extends (context: RouteContext) => unknown>(
  handler: TFn,
): TFn {
  return handler;
}

export { defineRoute, request, toClientResult };
