import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { users } from "$lib/server/database/schema/users";
import { TEST_USERS } from "$lib/test/fixtures/users";
import { testDatabase } from "$lib/test/utils/database";
import { testFetch } from "$lib/test/utils/fetch";
import { Err, Ok } from "$lib/types/result";

import { SignUpStartResponse } from "./sign-up";

describe("Sign Up", () => {
  describe("POST /auth/sign-up/start", () => {
    it("should create a new user and return session details", async () => {
      const response = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          captcha: "mock-captcha-token",
        }),
      });

      expect(response.status).toBe(201);
      const data = (await response.json()) as Ok<SignUpStartResponse>;

      expect(data).toEqual({
        ok: true,
        status: 201,
        data: {
          sessionId: expect.any(String),
          clientSalt: expect.any(String),
        },
      });
      expect(data.data!.sessionId).toHaveLength(24);
      expect(data.data!.clientSalt).toHaveLength(64);
    });

    it("should reject duplicate email addresses", async () => {
      // Try to sign up with existing user's email
      const existingUser = TEST_USERS.USER_ONE;
      const response = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Jane",
          lastName: "Doe",
          email: existingUser.email, // Use existing user's email
          captcha: "mock-captcha-token",
        }),
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as Err;

      expect(data).toEqual({
        ok: false,
        status: 400,
        errors: [
          {
            code: "custom",
            message: "already-exists",
            path: ["email"],
          },
        ],
      });
    });

    it("should validate required fields", async () => {
      const response = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "",
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
            path: ["firstName"],
            message: expect.any(String),
          }),
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

    it("should handle middle name properly", async () => {
      const response = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "John",
          middleName: "Michael",
          lastName: "Doe",
          email: "john.michael.doe@example.com",
          captcha: "mock-captcha-token",
        }),
      });

      expect(response.status).toBe(201);
      const data = (await response.json()) as Ok<SignUpStartResponse>;

      expect(data.ok).toBe(true);
      expect(data.data!.sessionId).toHaveLength(24);
      expect(data.data!.clientSalt).toHaveLength(64);
    });
  });

  describe("POST /auth/sign-up/finish", () => {
    it("should complete sign-up with valid session", async () => {
      // First, start sign-up
      const startResponse = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Alice",
          lastName: "Johnson",
          email: "alice.johnson@example.com",
          captcha: "mock-captcha-token",
        }),
      });

      const startData = (await startResponse.json()) as Ok<SignUpStartResponse>;
      const { sessionId } = startData.data!;

      // Then, finish sign-up
      const finishResponse = await testFetch("/auth/sign-up/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash: "a".repeat(128), // Mock password hash
          captcha: "mock-captcha-token",
        }),
      });

      expect(finishResponse.status).toBe(201);
      const finishData = (await finishResponse.json()) as Ok;

      expect(finishData).toEqual({
        ok: true,
        status: 201,
        message: "User signed up",
      });

      // Should set authentication cookies
      const cookies = finishResponse.headers.getSetCookie();
      expect(cookies).toEqual(
        expect.arrayContaining([
          expect.stringContaining("localhost-auth="),
          expect.stringContaining("localhost-auth-refresh="),
        ]),
      );

      // Verify user was created in database
      const createdUser = await testDatabase
        .select()
        .from(users)
        .where(eq(users.email, "alice.johnson@example.com"))
        .limit(1);

      expect(createdUser).toHaveLength(1);
      expect(createdUser[0]).toMatchObject({
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@example.com",
        emailVerified: false, // Should be false initially
        approved: false, // Should be false initially
      });
      expect(createdUser[0].password).toBeDefined();
      expect(createdUser[0].clientSalt).toBeDefined();
      expect(createdUser[0].serverSalt).toBeDefined();
    });

    it("should reject invalid session ID", async () => {
      const response = await testFetch("/auth/sign-up/finish", {
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
      // Start sign-up first
      const startResponse = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Bob",
          lastName: "Wilson",
          email: "bob.wilson@example.com",
          captcha: "mock-captcha-token",
        }),
      });

      const startData = (await startResponse.json()) as Ok<SignUpStartResponse>;
      const { sessionId } = startData.data!;

      // Try to finish with invalid password hash (not base64url)
      const finishResponse = await testFetch("/auth/sign-up/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash: "invalid-hash!", // Contains invalid characters
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

    it("should clean up session after successful completion", async () => {
      // Start sign-up
      const startResponse = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Carol",
          lastName: "Brown",
          email: "carol.brown@example.com",
          captcha: "mock-captcha-token",
        }),
      });

      const startData = (await startResponse.json()) as Ok<SignUpStartResponse>;
      const { sessionId } = startData.data!;

      // Finish sign-up
      await testFetch("/auth/sign-up/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash: "a".repeat(128),
          captcha: "mock-captcha-token",
        }),
      });

      // Try to use the same session again - should fail
      const secondFinishResponse = await testFetch("/auth/sign-up/finish", {
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
