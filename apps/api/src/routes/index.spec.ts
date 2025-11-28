import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { Ok } from "$lib/types/result";

import { testFetch } from "$test/utils/fetch";

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
