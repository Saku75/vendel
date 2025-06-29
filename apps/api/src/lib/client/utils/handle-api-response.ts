import {
  ClientErrorStatusCode,
  ServerErrorStatusCode,
} from "hono/utils/http-status";
import { JSONValue } from "hono/utils/types";

import type { Result } from "$lib/types/result";

async function handleApiResponse<T extends JSONValue = JSONValue>(
  res: Response,
): Promise<Result<T>> {
  const contentType = res.headers.get("content-type") || "";

  const isJson = contentType.includes("application/json");

  if (!isJson) {
    return {
      ok: false,
      status: res.status as ClientErrorStatusCode | ServerErrorStatusCode,
      message: await res.text(),
    };
  }

  return await res.json<Result<T>>();
}

export { handleApiResponse };
