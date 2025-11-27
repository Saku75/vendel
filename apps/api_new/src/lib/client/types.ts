import type { JSONValue } from "hono/utils/types";
import type { KyInstance } from "ky";

import type { Err, Ok } from "$lib/types/result";

type ClientResult<T extends JSONValue | undefined = undefined> =
  | (Ok<T> & { ok: true })
  | (Err & { ok: false });

interface ClientConfig {
  prefix?: string;
  fetch?: typeof fetch;
  headers?: HeadersInit;
  hooks?: {
    beforeRequest?: (request: Request) => void | Promise<void>;
    afterResponse?: (
      request: Request,
      response: Response,
    ) => void | Promise<void>;
  };
}

interface RouteContext {
  ky: KyInstance;
  config: ClientConfig;
  cookies: Map<string, string>;
}

type ExtractData<T> = T extends ClientResult<infer D> ? D : never;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  json?: JSONValue;
  searchParams?: Record<string, string | number | boolean>;
  headers?: HeadersInit;
}

export type {
  ClientConfig,
  ClientResult,
  ExtractData,
  RequestOptions,
  RouteContext,
};
