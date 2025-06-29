import type { ClientContext } from "./types/context";

function createClientRoute<T>(
  fn: (ctx: ClientContext, fetch: ClientContext["fetch"]) => T,
) {
  return fn;
}

export { createClientRoute };
