import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { refreshTokenFamilies } from "$lib/server/database/schema/refresh-token-families";
import { users } from "$lib/server/database/schema/users";
import { TEST_USERS } from "$lib/test/fixtures/users";
import { testDatabase } from "$lib/test/utils/database";
import { testFetch } from "$lib/test/utils/fetch";
import { Err, Ok } from "$lib/types/result";

import { SignInStartResponse } from "./sign-in";
import { WhoAmIResponse } from "./who-am-i";

describe("Who Am I", () => {
  describe("GET /auth/whoami", () => {
    it("should return user data for authenticated user", async () => {
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

      // Now test the who-am-i endpoint
      const whoAmIResponse = await testFetch("/auth/whoami", {
        method: "GET",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(whoAmIResponse.status).toBe(200);
      const data = (await whoAmIResponse.json()) as Ok<WhoAmIResponse>;

      expect(data).toEqual({
        ok: true,
        status: 200,
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            middleName: null,
            lastName: user.lastName,
            email: user.email,
            emailVerified: true,
            role: user.role,
            approved: true,
            approvedBy: null,
          },
          session: {
            expiresAt: expect.any(Number),
          },
        },
      });
    });

    it("should return user data for admin user", async () => {
      const user = TEST_USERS.ADMIN;

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

      // Now test the who-am-i endpoint
      const whoAmIResponse = await testFetch("/auth/whoami", {
        method: "GET",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(whoAmIResponse.status).toBe(200);
      const data = (await whoAmIResponse.json()) as Ok<WhoAmIResponse>;

      expect(data).toEqual({
        ok: true,
        status: 200,
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            middleName: null,
            lastName: user.lastName,
            email: user.email,
            emailVerified: true,
            role: user.role,
            approved: true,
            approvedBy: null,
          },
          session: {
            expiresAt: expect.any(Number),
          },
        },
      });
    });

    it("should return user data for super admin user", async () => {
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

      // Now test the who-am-i endpoint
      const whoAmIResponse = await testFetch("/auth/whoami", {
        method: "GET",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(whoAmIResponse.status).toBe(200);
      const data = (await whoAmIResponse.json()) as Ok<WhoAmIResponse>;

      expect(data).toEqual({
        ok: true,
        status: 200,
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            middleName: null,
            lastName: user.lastName,
            email: user.email,
            emailVerified: true,
            role: user.role,
            approved: true,
            approvedBy: null,
          },
          session: {
            expiresAt: expect.any(Number),
          },
        },
      });
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await testFetch("/auth/whoami", {
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
      const response = await testFetch("/auth/whoami", {
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

    it("should return 400 and sign out user when user does not exist in database", async () => {
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

      // Delete the user from the database to simulate user not existing
      await testDatabase.delete(users).where(eq(users.id, user.id));

      // Now test the who-am-i endpoint
      const whoAmIResponse = await testFetch("/auth/whoami", {
        method: "GET",
        headers: {
          Cookie: authCookies.join("; "),
        },
      });

      expect(whoAmIResponse.status).toBe(400);
      const data = (await whoAmIResponse.json()) as Err;

      expect(data).toEqual({
        ok: false,
        status: 400,
        message: "User does not exist",
      });

      // Verify that the refresh token family was deleted (user was signed out)
      const refreshTokenFamily = await testDatabase
        .select()
        .from(refreshTokenFamilies)
        .where(eq(refreshTokenFamilies.userId, user.id))
        .limit(1);

      expect(refreshTokenFamily).toHaveLength(0);

      // Verify that sign-out cookies were set
      const signOutCookies = whoAmIResponse.headers.getSetCookie();
      expect(signOutCookies).toEqual(
        expect.arrayContaining([
          expect.stringContaining("localhost-auth=; Max-Age=0"),
          expect.stringContaining("localhost-auth-refresh=; Max-Age=0"),
        ]),
      );
    });
  });
});
