import { parseString } from "set-cookie-parser";

import type { ClientConfig, FetchInstance, RouteContext } from "./types";

function createBaseClient(config: ClientConfig = {}): RouteContext {
  const cookies = new Map<string, string>();
  const fetchFn = config.fetch || fetch;

  const customFetch: FetchInstance = async (path, options = {}) => {
    // Construct full URL
    const prefix = config.prefix || "";
    let url = prefix ? `${prefix}/${path.replace(/^\//, "")}` : path;

    // Add search params if provided
    if (options.searchParams) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(options.searchParams)) {
        params.append(key, String(value));
      }
      url = `${url}?${params.toString()}`;
    }

    // Build headers
    const headers = new Headers(config.headers);
    if (options.headers) {
      const optionHeaders = new Headers(options.headers);
      optionHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }

    // Add cookies from store
    const cookieEntries = Array.from(cookies.entries());
    if (cookieEntries.length > 0) {
      const cookieHeader = cookieEntries
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");
      headers.set("cookie", cookieHeader);
    }

    // Handle JSON body
    let body: string | undefined;
    if (options.json !== undefined) {
      body = JSON.stringify(options.json);
      headers.set("content-type", "application/json");
    }

    // Call beforeRequest hook with a temporary Request for inspection
    if (config.hooks?.beforeRequest) {
      const tempRequest = new Request(url, {
        method: options.method || "GET",
        headers,
        body,
      });
      await config.hooks.beforeRequest(tempRequest);
    }

    // Make the fetch call directly with URL string to avoid Request object issues
    const response = await fetchFn(url, {
      method: options.method || "GET",
      headers,
      body,
    });

    // Extract and store cookies from response
    const setCookies = response.headers.getSetCookie?.() ?? [];
    for (const raw of setCookies) {
      const parsed = parseString(raw);
      if (parsed.name && parsed.value) {
        cookies.set(parsed.name, parsed.value);
      }
    }

    // Call afterResponse hook
    if (config.hooks?.afterResponse) {
      const request = new Request(url, {
        method: options.method || "GET",
        headers,
        body,
      });
      await config.hooks.afterResponse(request, response);
    }

    return response;
  };

  return {
    fetch: customFetch,
    config,
    cookies,
  };
}

export { createBaseClient };
