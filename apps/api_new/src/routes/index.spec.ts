import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { testFetch } from "$lib/test/utils/fetch";
import { Ok } from "$lib/types/result";

describe("Root", () => {
  it("should return welcome message", async () => {
    const response = await testFetch("/");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual<Ok>({
      status: 200,
      message: `Vendel API - ${env.MODE[0].toUpperCase() + env.MODE.slice(1)}`,
    });
  });
});
