import type { JSONValue } from "hono/utils/types";

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

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  json?: JSONValue;
  searchParams?: Record<string, string | number | boolean>;
  headers?: HeadersInit;
}

type FetchInstance = (
  path: string,
  options?: RequestOptions,
) => Promise<Response>;

interface RouteContext {
  fetch: FetchInstance;
  config: ClientConfig;
  cookies: Map<string, string>;
}

type ExtractData<T> = T extends ClientResult<infer D> ? D : never;

export type {
  ClientConfig,
  ClientResult,
  ExtractData,
  FetchInstance,
  RequestOptions,
  RouteContext,
};
