import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import type { Ok } from "$lib/types/result";

import { testFetch } from "$test/utils/fetch";

describe("Root", () => {
  it("should return welcome message", async () => {
    const response = await testFetch("/");

    expect(response.status).toBe(200);

    const json = await response.json<Ok<undefined>>();

    expect(json.status).toBe(200);
    expect(json.message).toBe(
      `Vendel API - ${env.MODE[0].toUpperCase() + env.MODE.slice(1)}`,
    );
  });
});
