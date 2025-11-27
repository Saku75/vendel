import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { bytesToBase64 } from "@package/crypto-utils/bytes";
import { scrypt } from "@package/crypto-utils/scrypt";

import { users } from "$lib/database/schema/users";
import type { Err, Ok } from "$lib/types/result";

import { testUsers } from "$test/fixtures/users";
import { testDatabase } from "$test/utils/database";
import { testFetch } from "$test/utils/fetch";

describe("Sign-in", () => {
  describe("POST /auth/sign-in/start", () => {
    const validPayload = {
      email: testUsers.UserOne.email,
      captcha: "test-captcha-token",
    };

    it("should return sessionId and clientSalt for existing user", async () => {
      const response = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPayload),
      });

      expect(response.status).toBe(200);

      const json = (await response.json()) as Ok<{
        sessionId: string;
        clientSalt: string;
      }>;

      expect(json.status).toBe(200);
      expect(json.data).toBeDefined();
      expect(json.data!.sessionId).toMatch(/^[a-z0-9]{24}$/);
      expect(json.data!.clientSalt).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should return fake salts for non-existent user (timing attack prevention)", async () => {
      const response = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          captcha: "test-captcha-token",
        }),
      });

      // Should still return 200 with sessionId and clientSalt
      expect(response.status).toBe(200);

      const json = (await response.json()) as Ok<{
        sessionId: string;
        clientSalt: string;
      }>;

      expect(json.status).toBe(200);
      expect(json.data).toBeDefined();
      expect(json.data!.sessionId).toMatch(/^[a-z0-9]{24}$/);
      expect(json.data!.clientSalt).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should reject invalid email format", async () => {
      const response = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "not-an-email",
          captcha: "test-captcha-token",
        }),
      });

      expect(response.status).toBe(400);

      const json = (await response.json()) as Err;

      expect(json.status).toBe(400);
      expect(json.errors).toBeDefined();
      expect(json.errors!.some((e) => e.path[0] === "email")).toBe(true);
    });

    it("should reject missing required fields", async () => {
      const response = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captcha: "test-captcha-token",
          // Missing email
        }),
      });

      expect(response.status).toBe(400);

      const json = (await response.json()) as Err;

      expect(json.status).toBe(400);
      expect(json.errors).toBeDefined();
      expect(json.errors!.some((e) => e.path[0] === "email")).toBe(true);
    });
  });

  describe("POST /auth/sign-in/finish", () => {
    let sessionId: string;
    let clientSalt: string;

    beforeEach(async () => {
      // Create a sign-in session first
      const startResponse = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUsers.UserOne.email,
          captcha: "test-captcha-token",
        }),
      });

      const startJson = (await startResponse.json()) as Ok<{
        sessionId: string;
        clientSalt: string;
      }>;

      sessionId = startJson.data!.sessionId;
      clientSalt = startJson.data!.clientSalt;
    });

    it("should sign in user with valid credentials", async () => {
      const password = testUsers.UserOne.password;
      const passwordClientHash = bytesToBase64(
        await scrypt(password, clientSalt),
      );

      const response = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash,
          captcha: "test-captcha-token",
        }),
      });

      expect(response.status).toBe(200);

      const json = (await response.json()) as Ok;

      expect(json.status).toBe(200);
      expect(json.message).toBe("User signed in");

      // Verify cookies are set
      const cookies = response.headers.get("set-cookie");
      expect(cookies).toBeDefined();
      expect(cookies).toContain("access");
      expect(cookies).toContain("refresh");
    });

    it("should return generic error for wrong password", async () => {
      const wrongPassword = "WrongPassword123!";
      const passwordClientHash = bytesToBase64(
        await scrypt(wrongPassword, clientSalt),
      );

      const response = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash,
          captcha: "test-captcha-token",
        }),
      });

      expect(response.status).toBe(401);

      const json = (await response.json()) as Ok;

      expect(json.status).toBe(401);
      expect(json.message).toBe("Invalid email or password");
      // Should NOT have field-specific errors
      expect((json as Err).errors).toBeUndefined();
    });

    it("should return generic error for non-existent user", async () => {
      // Create session for non-existent user
      const startResponse = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          captcha: "test-captcha-token",
        }),
      });

      const startJson = (await startResponse.json()) as Ok<{
        sessionId: string;
        clientSalt: string;
      }>;

      const passwordClientHash = bytesToBase64(
        await scrypt("SomePassword123!", startJson.data!.clientSalt),
      );

      const response = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: startJson.data!.sessionId,
          passwordClientHash,
          captcha: "test-captcha-token",
        }),
      });

      expect(response.status).toBe(401);

      const json = (await response.json()) as Ok;

      expect(json.status).toBe(401);
      expect(json.message).toBe("Invalid email or password");
      // Should NOT have field-specific errors
      expect((json as Err).errors).toBeUndefined();
    });

    it("should reject with invalid session", async () => {
      const passwordClientHash = bytesToBase64(
        await scrypt(testUsers.UserOne.password, clientSalt),
      );

      const response = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "invalid_session_id_123",
          passwordClientHash,
          captcha: "test-captcha-token",
        }),
      });

      expect(response.status).toBe(400);

      const json = (await response.json()) as Err;

      expect(json.status).toBe(400);
      expect(json.errors).toBeDefined();
      expect(json.errors!.some((e) => e.path[0] === "sessionId")).toBe(true);
    });

    it("should delete session after successful sign-in", async () => {
      const password = testUsers.UserOne.password;
      const passwordClientHash = bytesToBase64(
        await scrypt(password, clientSalt),
      );

      // First request should succeed
      const firstResponse = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash,
          captcha: "test-captcha-token",
        }),
      });

      expect(firstResponse.status).toBe(200);

      // Second request with same sessionId should fail (session deleted)
      const secondResponse = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash,
          captcha: "test-captcha-token",
        }),
      });

      expect(secondResponse.status).toBe(400);

      const json = (await secondResponse.json()) as Err;

      expect(json.status).toBe(400);
      expect(json.errors!.some((e) => e.path[0] === "sessionId")).toBe(true);
    });

    it("should delete session even after failed attempt", async () => {
      const wrongPassword = "WrongPassword123!";
      const passwordClientHash = bytesToBase64(
        await scrypt(wrongPassword, clientSalt),
      );

      // First request with wrong password
      const firstResponse = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash,
          captcha: "test-captcha-token",
        }),
      });

      expect(firstResponse.status).toBe(401);

      // Second request should fail because session was deleted
      const secondResponse = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash,
          captcha: "test-captcha-token",
        }),
      });

      expect(secondResponse.status).toBe(400);

      const json = (await secondResponse.json()) as Err;

      expect(json.status).toBe(400);
      expect(json.errors!.some((e) => e.path[0] === "sessionId")).toBe(true);
    });

    it("should handle missing password hash", async () => {
      const response = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          captcha: "test-captcha-token",
          // Missing passwordClientHash
        }),
      });

      expect(response.status).toBe(400);

      const json = (await response.json()) as Err;

      expect(json.status).toBe(400);
      expect(json.errors).toBeDefined();
      expect(json.errors!.some((e) => e.path[0] === "passwordClientHash")).toBe(
        true,
      );
    });
  });

  describe("Full sign-in flow", () => {
    it("should complete full sign-in flow successfully", async () => {
      const email = testUsers.UserOne.email;
      const password = testUsers.UserOne.password;

      // Step 1: Start sign-in
      const startResponse = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          captcha: "test-captcha-token",
        }),
      });

      expect(startResponse.status).toBe(200);

      const startJson = (await startResponse.json()) as Ok<{
        sessionId: string;
        clientSalt: string;
      }>;

      // Step 2: Hash password client-side
      const passwordClientHash = bytesToBase64(
        await scrypt(password, startJson.data!.clientSalt),
      );

      // Step 3: Finish sign-in
      const finishResponse = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: startJson.data!.sessionId,
          passwordClientHash,
          captcha: "test-captcha-token",
        }),
      });

      expect(finishResponse.status).toBe(200);

      // Step 4: Verify user is signed in (cookies set)
      const cookies = finishResponse.headers.get("set-cookie");
      expect(cookies).toContain("access");
      expect(cookies).toContain("refresh");
    });

    it("should work for newly signed up user", async () => {
      const email = "newsignin@example.com";
      const password = "NewSignInPassword123!";

      // First, sign up the user
      const signUpStart = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "New",
          lastName: "SignIn",
          email,
          captcha: "test-captcha-token",
        }),
      });

      const signUpStartJson = (await signUpStart.json()) as Ok<{
        sessionId: string;
        clientSalt: string;
      }>;

      const signUpPasswordHash = bytesToBase64(
        await scrypt(password, signUpStartJson.data!.clientSalt),
      );

      await testFetch("/auth/sign-up/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: signUpStartJson.data!.sessionId,
          passwordClientHash: signUpPasswordHash,
          captcha: "test-captcha-token",
        }),
      });

      // Now try to sign in
      const signInStart = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          captcha: "test-captcha-token",
        }),
      });

      const signInStartJson = (await signInStart.json()) as Ok<{
        sessionId: string;
        clientSalt: string;
      }>;

      const signInPasswordHash = bytesToBase64(
        await scrypt(password, signInStartJson.data!.clientSalt),
      );

      const signInFinish = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: signInStartJson.data!.sessionId,
          passwordClientHash: signInPasswordHash,
          captcha: "test-captcha-token",
        }),
      });

      expect(signInFinish.status).toBe(200);

      const cookies = signInFinish.headers.get("set-cookie");
      expect(cookies).toContain("access");
      expect(cookies).toContain("refresh");
    });
  });
});
