import { env, SELF } from "cloudflare:test";
import { expect, it } from "vitest";

it("should return API welcome message", async () => {
  const response = await SELF.fetch(env.API_ORIGIN);
  expect(response.status).toBe(200);

  expect(await response.json()).toEqual({
    status: 200,
    message: "This is the Vendel.dk API",
  });
});
