import { env, SELF } from "cloudflare:test";

function testFetch(input: RequestInfo | URL, init?: RequestInit) {
  return SELF.fetch(`${env.API_ORIGIN}${input}`, init);
}

export { testFetch };
