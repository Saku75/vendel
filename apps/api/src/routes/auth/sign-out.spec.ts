import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { refreshTokenFamilies } from "$lib/server/database/schema/refresh-token-families";
import { TEST_USERS } from "$lib/test/fixtures/users";
import { testDatabase } from "$lib/test/utils/database";
import { testFetch } from "$lib/test/utils/fetch";
import { Err, Ok } from "$lib/types/result";

import { SignInStartResponse } from "./sign-in";

describe("Sign Out", () => {
  describe("GET /auth/sign-out", () => {
    it("should successfully sign out authenticated user", async () => {
      const user = TEST_USERS.USER_ONE;

      // First sign in to get auth cookies
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

      const authCookies = finishResponse.headers.getSetCookie();

      // Now test the sign-out endpoint
      const signOutResponse = await testFetch("/auth/sign-out", {
        method: "GET",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(signOutResponse.status).toBe(200);
      const data = (await signOutResponse.json()) as Ok;

      expect(data).toEqual({
        ok: true,
        status: 200,
        message: "User signed out",
      });

      // Verify that sign-out cookies were set
      const signOutCookies = signOutResponse.headers.getSetCookie();
      expect(signOutCookies).toEqual(
        expect.arrayContaining([
          expect.stringContaining("localhost-auth=; Max-Age=0"),
          expect.stringContaining("localhost-auth-refresh=; Max-Age=0"),
        ]),
      );
    });

    it("should invalidate refresh token family when signing out", async () => {
      const user = TEST_USERS.USER_TWO;

      // First sign in to get auth cookies
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

      const authCookies = finishResponse.headers.getSetCookie();

      // Verify token family exists and is not invalidated before sign-out
      const beforeSignOut = await testDatabase
        .select()
        .from(refreshTokenFamilies)
        .where(eq(refreshTokenFamilies.userId, user.id))
        .limit(1);

      expect(beforeSignOut).toHaveLength(1);
      expect(beforeSignOut[0].invalidated).toBe(false);

      // Now sign out
      const signOutResponse = await testFetch("/auth/sign-out", {
        method: "GET",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(signOutResponse.status).toBe(200);

      // Verify that the refresh token family was invalidated
      const afterSignOut = await testDatabase
        .select()
        .from(refreshTokenFamilies)
        .where(eq(refreshTokenFamilies.userId, user.id))
        .limit(1);

      expect(afterSignOut).toHaveLength(1);
      expect(afterSignOut[0].invalidated).toBe(true);
    });

    it("should mark refresh token as used in KV session", async () => {
      const user = TEST_USERS.ADMIN;

      // First sign in to get auth cookies and extract refresh token ID
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

      const authCookies = finishResponse.headers.getSetCookie();

      // Extract refresh token ID from auth cookie to check KV session
      const authCookieValue = authCookies
        .find((cookie) => cookie.startsWith("localhost-auth="))
        ?.split("=")[1]
        ?.split(";")[0];

      expect(authCookieValue).toBeDefined();

      // Decode the auth cookie to get refresh token ID (simplified check)
      // We'll verify the session exists before sign-out by making a who-am-i call
      const beforeSignOutCheck = await testFetch("/auth/whoami", {
        method: "GET",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(beforeSignOutCheck.status).toBe(200);

      // Now sign out
      const signOutResponse = await testFetch("/auth/sign-out", {
        method: "GET",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(signOutResponse.status).toBe(200);

      // Verify that using the same cookies no longer works (session invalidated)
      const afterSignOutCheck = await testFetch("/auth/whoami", {
        method: "GET",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(afterSignOutCheck.status).toBe(401);
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await testFetch("/auth/sign-out", {
        method: "GET",
      });

      expect(response.status).toBe(401);
      const data = (await response.json()) as Err;

      expect(data).toEqual({
        ok: false,
        status: 401,
        message: "Not authenticated",
      });
    });

    it("should return 401 for invalid auth cookies", async () => {
      const response = await testFetch("/auth/sign-out", {
        method: "GET",
        headers: {
          Cookie:
            "localhost-auth=invalid-token; localhost-auth-refresh=invalid-refresh-token",
        },
      });

      expect(response.status).toBe(401);
      const data = (await response.json()) as Err;

      expect(data).toEqual({
        ok: false,
        status: 401,
        message: "Not authenticated",
      });
    });

    it("should handle sign-out when token family doesn't exist", async () => {
      const user = TEST_USERS.SUPER_ADMIN;

      // First sign in to get auth cookies
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

      const authCookies = finishResponse.headers.getSetCookie();

      // Manually delete the token family to simulate edge case
      await testDatabase
        .delete(refreshTokenFamilies)
        .where(eq(refreshTokenFamilies.userId, user.id));

      // Sign out should still work (gracefully handle missing token family)
      const signOutResponse = await testFetch("/auth/sign-out", {
        method: "GET",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(signOutResponse.status).toBe(200);
      const data = (await signOutResponse.json()) as Ok;

      expect(data).toEqual({
        ok: true,
        status: 200,
        message: "User signed out",
      });

      // Verify that sign-out cookies were still set
      const signOutCookies = signOutResponse.headers.getSetCookie();
      expect(signOutCookies).toEqual(
        expect.arrayContaining([
          expect.stringContaining("localhost-auth=; Max-Age=0"),
          expect.stringContaining("localhost-auth-refresh=; Max-Age=0"),
        ]),
      );
    });

    it("should handle multiple sign-out attempts gracefully", async () => {
      const user = TEST_USERS.USER_ONE;

      // First sign in to get auth cookies
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

      const authCookies = finishResponse.headers.getSetCookie();

      // First sign-out should succeed
      const firstSignOutResponse = await testFetch("/auth/sign-out", {
        method: "GET",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(firstSignOutResponse.status).toBe(200);

      // Second sign-out attempt with same cookies should fail (401)
      const secondSignOutResponse = await testFetch("/auth/sign-out", {
        method: "GET",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(secondSignOutResponse.status).toBe(401);
      const data = (await secondSignOutResponse.json()) as Err;

      expect(data).toEqual({
        ok: false,
        status: 401,
        message: "Not authenticated",
      });
    });
  });
});
