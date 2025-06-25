import kyFactory from "ky";

import type { ClientContext } from "./context";

function createClientRoute<T>(
  factory: (ky: ReturnType<typeof kyFactory.create>, ctx?: ClientContext) => T,
): (ctx?: ClientContext) => T {
  return (ctx) => {
    const ky = kyFactory.create({
      fetch: ctx?.fetch,
    });

    return factory(ky, ctx);
  };
}

export { createClientRoute };
