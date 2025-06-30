import type { ClientContext } from "./types/context";

function createClientRoute<T>(
  fn: (config: { context: ClientContext; fetch: ClientContext["fetch"] }) => T,
) {
  return fn;
}

export { createClientRoute };
