import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { refreshTokenFamilies } from "$lib/server/database/schema/refresh-token-families";
import { TEST_USERS } from "$lib/test/fixtures/users";
import { testDatabase } from "$lib/test/utils/database";
import { testFetch } from "$lib/test/utils/fetch";
import { Err, Ok } from "$lib/types/result";

import { SignInStartResponse } from "./sign-in";

describe("Sign In", () => {
  describe("POST /auth/sign-in/start", () => {
    it("should return session details for existing user", async () => {
      const user = TEST_USERS.USER_ONE;

      const response = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          captcha: "mock-captcha-token",
        }),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as Ok<SignInStartResponse>;

      expect(data).toEqual({
        ok: true,
        status: 200,
        data: {
          sessionId: expect.any(String),
          clientSalt: expect.any(String),
        },
      });
      expect(data.data!.sessionId).toHaveLength(24);
      expect(data.data!.clientSalt).toHaveLength(64);
    });

    it("should return fake session details for non-existing user", async () => {
      const response = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@test.com",
          captcha: "mock-captcha-token",
        }),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as Ok<SignInStartResponse>;

      expect(data).toEqual({
        ok: true,
        status: 200,
        data: {
          sessionId: expect.any(String),
          clientSalt: expect.any(String),
        },
      });
      expect(data.data!.sessionId).toHaveLength(24);
      expect(data.data!.clientSalt).toHaveLength(64);
    });

    it("should validate required fields", async () => {
      const response = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid-email",
          captcha: "",
        }),
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as Err;

      expect(data.ok).toBe(false);
      expect(data.status).toBe(400);
      expect(data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["email"],
            message: expect.any(String),
          }),
          expect.objectContaining({
            path: ["captcha"],
            message: expect.any(String),
          }),
        ]),
      );
    });

    it("should reject invalid captcha", async () => {
      const response = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          captcha: "",
        }),
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as Err;

      expect(data.ok).toBe(false);
      expect(data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["captcha"],
            message: expect.any(String),
          }),
        ]),
      );
    });
  });

  describe("POST /auth/sign-in/finish", () => {
    it("should successfully sign in existing user with correct password", async () => {
      const user = TEST_USERS.USER_ONE;

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

      expect(finishResponse.status).toBe(200);
      const finishData = (await finishResponse.json()) as Ok;

      expect(finishData).toEqual({
        ok: true,
        status: 200,
        message: "User signed in",
      });

      const cookies = finishResponse.headers.getSetCookie();
      expect(cookies).toEqual(
        expect.arrayContaining([
          expect.stringContaining("localhost-auth="),
          expect.stringContaining("localhost-auth-refresh="),
        ]),
      );

      const refreshTokenFamily = await testDatabase
        .select()
        .from(refreshTokenFamilies)
        .where(eq(refreshTokenFamilies.userId, user.id))
        .limit(1);

      expect(refreshTokenFamily).toHaveLength(1);
      expect(refreshTokenFamily[0]).toMatchObject({
        userId: user.id,
        invalidated: false,
      });
      expect(refreshTokenFamily[0].id).toBeDefined();
      expect(refreshTokenFamily[0].createdAt).toBeDefined();
    });

    it("should reject sign-in with wrong password", async () => {
      const user = TEST_USERS.USER_TWO;

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
          passwordClientHash: "wrong-password-hash",
          captcha: "mock-captcha-token",
        }),
      });

      expect(finishResponse.status).toBe(400);
      const finishData = (await finishResponse.json()) as Err;

      expect(finishData.ok).toBe(false);
      expect(finishData.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["email"],
            message: "invalid",
          }),
          expect.objectContaining({
            path: ["password"],
            message: "invalid",
          }),
        ]),
      );
    });

    it("should reject sign-in for non-existing user", async () => {
      const startResponse = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent.signin@example.com",
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
          passwordClientHash: "a".repeat(128),
          captcha: "mock-captcha-token",
        }),
      });

      expect(finishResponse.status).toBe(400);
      const finishData = (await finishResponse.json()) as Err;

      expect(finishData.ok).toBe(false);
      expect(finishData.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["email"],
            message: "invalid",
          }),
          expect.objectContaining({
            path: ["password"],
            message: "invalid",
          }),
        ]),
      );
    });

    it("should reject invalid session ID", async () => {
      const response = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "invalid-session-id",
          passwordClientHash: "a".repeat(128),
          captcha: "mock-captcha-token",
        }),
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as Err;

      expect(data.ok).toBe(false);
      expect(data.status).toBe(400);
      expect(data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "custom",
            message: "not-found",
            path: ["sessionId"],
          }),
        ]),
      );
    });

    it("should validate password hash format", async () => {
      const user = TEST_USERS.ADMIN;

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
          passwordClientHash: "invalid-hash!",
          captcha: "mock-captcha-token",
        }),
      });

      expect(finishResponse.status).toBe(400);
      const finishData = (await finishResponse.json()) as Err;

      expect(finishData.ok).toBe(false);
      expect(finishData.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["passwordClientHash"],
            message: "invalid-format",
          }),
        ]),
      );
    });

    it("should clean up session after successful sign-in", async () => {
      const user = TEST_USERS.SUPER_ADMIN;

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

      await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash: user.password,
          captcha: "mock-captcha-token",
        }),
      });

      const secondFinishResponse = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash: user.password,
          captcha: "mock-captcha-token",
        }),
      });

      expect(secondFinishResponse.status).toBe(400);
      const secondFinishData = (await secondFinishResponse.json()) as Err;

      expect(secondFinishData.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["sessionId"],
            message: "not-found",
          }),
        ]),
      );
    });

    it("should clean up session after failed sign-in", async () => {
      const user = TEST_USERS.ADMIN;

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

      await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash: "wrong-password",
          captcha: "mock-captcha-token",
        }),
      });

      const secondFinishResponse = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash: "a".repeat(128),
          captcha: "mock-captcha-token",
        }),
      });

      expect(secondFinishResponse.status).toBe(400);
      const secondFinishData = (await secondFinishResponse.json()) as Err;

      expect(secondFinishData.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["sessionId"],
            message: "not-found",
          }),
        ]),
      );
    });
  });
});
