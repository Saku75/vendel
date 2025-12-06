import { env, SELF } from "cloudflare:test";

function testFetch(input: string, init?: RequestInit) {
  return SELF.fetch(`${env.API_ORIGINS.split(",")[0]}${input}`, init);
}

export { testFetch };
