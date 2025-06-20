import { describe, expect, it } from "vitest";

import { testFetch } from "$lib/test/utils/fetch";

describe("Root", () => {
  it("should return API welcome message", async () => {
    const response = await testFetch("/");
    expect(response.status).toBe(200);

    expect(await response.json()).toEqual({
      status: 200,
      message: "Vendel.dk API",
    });
  });
});
