import { describe, expect, it } from "vitest";

import { TEST_USERS } from "$lib/test/fixtures/users";
import { testFetch } from "$lib/test/utils/fetch";
import { Err, Ok } from "$lib/types/result";

import { SignInStartResponse } from "./sign-in";

async function signInUser(user: typeof TEST_USERS.USER_ONE) {
  const startResponse = await testFetch("/auth/sign-in/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      captcha: "mock-captcha-token",
    }),
  });

  const startData = (await startResponse.json()) as Ok<SignInStartResponse>;
  const { sessionId } = startData.data!;

  const finishResponse = await testFetch("/auth/sign-in/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      passwordClientHash: user.password,
      captcha: "mock-captcha-token",
    }),
  });

  return finishResponse.headers.getSetCookie();
}

describe("Refresh", () => {
  describe("POST /auth/refresh", () => {
    it("should successfully refresh a valid session", async () => {
      const user = TEST_USERS.USER_ONE;
      const authCookies = await signInUser(user);

      const refreshResponse = await testFetch("/auth/refresh", {
        method: "POST",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(refreshResponse.status).toBe(200);
      const data = (await refreshResponse.json()) as Ok;

      expect(data).toEqual({
        ok: true,
        status: 200,
        message: "Session refreshed",
      });

      // Verify new cookies are set
      const newCookies = refreshResponse.headers.getSetCookie();
      expect(newCookies.length).toBeGreaterThan(0);
      expect(
        newCookies.some((cookie) => cookie.includes("localhost-auth=")),
      ).toBe(true);
      expect(
        newCookies.some((cookie) => cookie.includes("localhost-auth-refresh=")),
      ).toBe(true);
    });

    it("should reject unauthenticated requests", async () => {
      const response = await testFetch("/auth/refresh", {
        method: "POST",
      });

      expect(response.status).toBe(401);
      const data = (await response.json()) as Err;

      expect(data).toEqual({
        ok: false,
        status: 401,
        message: "Not authenticated",
      });
    });

    it("should reject requests without refresh cookie", async () => {
      const user = TEST_USERS.USER_ONE;
      const authCookies = await signInUser(user);

      // Filter out the refresh cookie, keep only auth cookie
      const authOnlyCookies = authCookies.filter(
        (cookie) => !cookie.includes("localhost-auth-refresh="),
      );

      const refreshResponse = await testFetch("/auth/refresh", {
        method: "POST",
        headers: {
          Cookie: authOnlyCookies.join("; "),
        },
      });

      expect(refreshResponse.status).toBe(401);
      const data = (await refreshResponse.json()) as Err;

      expect(data).toEqual({
        ok: false,
        status: 401,
        message: "Invalid refresh token",
      });
    });

    it("should work with both auth and refresh cookies", async () => {
      const user = TEST_USERS.USER_TWO;
      const authCookies = await signInUser(user);

      // The refresh endpoint needs both cookies - auth token contains the refresh token ID
      // and refresh cookie provides the actual refresh token
      const refreshResponse = await testFetch("/auth/refresh", {
        method: "POST",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(refreshResponse.status).toBe(200);
      const data = (await refreshResponse.json()) as Ok;

      expect(data).toEqual({
        ok: true,
        status: 200,
        message: "Session refreshed",
      });

      // Verify new cookies are set
      const newCookies = refreshResponse.headers.getSetCookie();
      expect(newCookies.length).toBeGreaterThan(0);
    });

    it("should reject token replay attacks", async () => {
      const user = TEST_USERS.ADMIN;
      const authCookies = await signInUser(user);

      // First refresh (legitimate)
      const firstRefreshResponse = await testFetch("/auth/refresh", {
        method: "POST",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(firstRefreshResponse.status).toBe(200);

      // Attempt to use the same cookies again (token replay attack)
      const secondRefreshResponse = await testFetch("/auth/refresh", {
        method: "POST",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(secondRefreshResponse.status).toBe(401);
      const data = (await secondRefreshResponse.json()) as Err;

      // Should invalidate the token family
      expect(data.message).toMatch(
        /family invalidated|Token mismatch|Session not found/,
      );
    });
  });
});
