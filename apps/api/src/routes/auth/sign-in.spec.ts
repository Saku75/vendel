import { describe, expect, it } from "vitest";

import { testFetch } from "$lib/test/utils/fetch";
import { TEST_USERS } from "$lib/test/setup/02-users";
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
      const data = await response.json() as Ok<SignInStartResponse>;
      
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
      const data = await response.json() as Ok<SignInStartResponse>;
      
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
      const data = await response.json() as Err;
      
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
        ])
      );
    });

    it("should reject invalid captcha", async () => {
      const response = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          captcha: "", // Empty captcha should fail validation
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json() as Err;
      
      expect(data.ok).toBe(false);
      expect(data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["captcha"],
            message: expect.any(String),
          }),
        ])
      );
    });
  });

  describe("POST /auth/sign-in/finish", () => {
    it("should successfully sign in existing user with correct password", async () => {
      const user = TEST_USERS.USER_ONE;

      // Start sign-in
      const startResponse = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          captcha: "mock-captcha-token",
        }),
      });

      const startData = await startResponse.json() as Ok<SignInStartResponse>;
      const { sessionId } = startData.data!;

      // Finish sign-in
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
      const finishData = await finishResponse.json() as Ok;
      
      expect(finishData).toEqual({
        ok: true,
        status: 200,
        message: "User signed in",
      });

      // Should set authentication cookies
      const cookies = finishResponse.headers.getSetCookie();
      expect(cookies).toEqual(
        expect.arrayContaining([
          expect.stringContaining("localhost-auth="),
          expect.stringContaining("localhost-auth-refresh="),
        ])
      );
    });

    it("should reject sign-in with wrong password", async () => {
      const user = TEST_USERS.USER_TWO;

      // Start sign-in
      const startResponse = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          captcha: "mock-captcha-token",
        }),
      });

      const startData = await startResponse.json() as Ok<SignInStartResponse>;
      const { sessionId } = startData.data!;

      // Finish sign-in with wrong password
      const finishResponse = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash: "wrong-password-hash", // Wrong password
          captcha: "mock-captcha-token",
        }),
      });

      expect(finishResponse.status).toBe(400);
      const finishData = await finishResponse.json() as Err;
      
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
        ])
      );
    });

    it("should reject sign-in for non-existing user", async () => {
      // Start sign-in with non-existing user
      const startResponse = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent.signin@example.com",
          captcha: "mock-captcha-token",
        }),
      });

      const startData = await startResponse.json() as Ok<SignInStartResponse>;
      const { sessionId } = startData.data!;

      // Try to finish sign-in
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
      const finishData = await finishResponse.json() as Err;
      
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
        ])
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
      const data = await response.json() as Err;
      
      expect(data.ok).toBe(false);
      expect(data.status).toBe(400);
      expect(data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "custom",
            message: "not-found",
            path: ["sessionId"],
          }),
        ])
      );
    });

    it("should validate password hash format", async () => {
      const user = TEST_USERS.ADMIN;

      // Start sign-in
      const startResponse = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          captcha: "mock-captcha-token",
        }),
      });

      const startData = await startResponse.json() as Ok<SignInStartResponse>;
      const { sessionId } = startData.data!;

      // Try to finish with invalid password hash format
      const finishResponse = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash: "invalid-hash!", // Contains invalid characters
          captcha: "mock-captcha-token",
        }),
      });

      expect(finishResponse.status).toBe(400);
      const finishData = await finishResponse.json() as Err;
      
      expect(finishData.ok).toBe(false);
      expect(finishData.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["passwordClientHash"],
            message: "invalid-format",
          }),
        ])
      );
    });

    it("should clean up session after successful sign-in", async () => {
      const user = TEST_USERS.SUPER_ADMIN;

      // Start sign-in
      const startResponse = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          captcha: "mock-captcha-token",
        }),
      });

      const startData = await startResponse.json() as Ok<SignInStartResponse>;
      const { sessionId } = startData.data!;

      // Successful sign-in
      await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash: user.password,
          captcha: "mock-captcha-token",
        }),
      });

      // Try to use the same session again - should fail
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
      const secondFinishData = await secondFinishResponse.json() as Err;
      
      expect(secondFinishData.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["sessionId"],
            message: "not-found",
          }),
        ])
      );
    });

    it("should clean up session after failed sign-in", async () => {
      const user = TEST_USERS.ADMIN;

      // Start sign-in
      const startResponse = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          captcha: "mock-captcha-token",
        }),
      });

      const startData = await startResponse.json() as Ok<SignInStartResponse>;
      const { sessionId } = startData.data!;

      // Failed sign-in
      await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash: "wrong-password",
          captcha: "mock-captcha-token",
        }),
      });

      // Try to use the same session again - should fail with session not found
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
      const secondFinishData = await secondFinishResponse.json() as Err;
      
      expect(secondFinishData.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["sessionId"],
            message: "not-found",
          }),
        ])
      );
    });
  });
});