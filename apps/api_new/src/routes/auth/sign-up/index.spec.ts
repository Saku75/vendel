import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { bytesToBase64 } from "@package/crypto-utils/bytes";
import { scrypt } from "@package/crypto-utils/scrypt";

import { users } from "$lib/database/schema/users";
import { AuthRole } from "$lib/enums/auth/role";
import type { Err, Ok } from "$lib/types/result";

import { testUsers } from "$test/fixtures/users";
import { testDatabase } from "$test/utils/database";
import { testFetch } from "$test/utils/fetch";

describe("Sign-up", () => {
  describe("POST /auth/sign-up/start", () => {
    const validPayload = {
      firstName: "John",
      middleName: "M",
      lastName: "Doe",
      email: "john.doe@example.com",
      captcha: "test-captcha-token",
    };

    it("should create sign-up session and return sessionId and clientSalt", async () => {
      const response = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPayload),
      });

      expect(response.status).toBe(201);

      const json = (await response.json()) as Ok<{
        sessionId: string;
        clientSalt: string;
      }>;

      expect(json.status).toBe(201);
      expect(json.data).toBeDefined();
      expect(json.data!.sessionId).toMatch(/^[a-z0-9]{24}$/);
      expect(json.data!.clientSalt).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should reject if email already exists", async () => {
      const response = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validPayload,
          email: testUsers.UserOne.email, // Use existing user email
        }),
      });

      expect(response.status).toBe(400);

      const json = (await response.json()) as Err;

      expect(json.status).toBe(400);
      expect(json.errors).toBeDefined();
      expect(json.errors!.some((e) => e.path[0] === "email")).toBe(true);
    });

    it("should handle optional fields correctly", async () => {
      const response = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Jane",
          email: "jane.doe@example.com",
          captcha: "test-captcha-token",
        }),
      });

      expect(response.status).toBe(201);

      const json = (await response.json()) as Ok<{
        sessionId: string;
        clientSalt: string;
      }>;

      expect(json.status).toBe(201);
      expect(json.data).toBeDefined();
    });

    it("should reject missing required fields", async () => {
      const response = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "John",
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

    it("should reject invalid email format", async () => {
      const response = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validPayload,
          email: "not-an-email",
        }),
      });

      expect(response.status).toBe(400);

      const json = (await response.json()) as Err;

      expect(json.status).toBe(400);
      expect(json.errors).toBeDefined();
      expect(json.errors!.some((e) => e.path[0] === "email")).toBe(true);
    });
  });

  describe("POST /auth/sign-up/finish", () => {
    let sessionId: string;
    let clientSalt: string;

    beforeEach(async () => {
      // Create a sign-up session first
      const startResponse = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Test",
          middleName: "M",
          lastName: "User",
          email: "test.user@example.com",
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

    it("should create user and sign them in", async () => {
      const password = "SecurePassword123!";
      const passwordClientHash = bytesToBase64(await scrypt(password, clientSalt));

      const response = await testFetch("/auth/sign-up/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash,
          captcha: "test-captcha-token",
        }),
      });

      expect(response.status).toBe(201);

      const json = (await response.json()) as Ok;

      expect(json.status).toBe(201);
      expect(json.message).toBe("User signed up");

      // Verify cookies are set
      const cookies = response.headers.get("set-cookie");
      expect(cookies).toBeDefined();
      expect(cookies).toContain("access");
      expect(cookies).toContain("refresh");

      // Verify user was created in database
      const [user] = await testDatabase
        .select()
        .from(users)
        .where(eq(users.email, "test.user@example.com"));

      expect(user).toBeDefined();
      expect(user.firstName).toBe("Test");
      expect(user.middleName).toBe("M");
      expect(user.lastName).toBe("User");
      expect(user.email).toBe("test.user@example.com");
      expect(user.role).toBe(AuthRole.Guest);
      expect(user.emailVerified).toBe(false);
      expect(user.password).toBeInstanceOf(Buffer);
    });

    it("should reject with invalid session", async () => {
      const password = "SecurePassword123!";
      const passwordClientHash = bytesToBase64(await scrypt(password, clientSalt));

      const response = await testFetch("/auth/sign-up/finish", {
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

    it("should delete session after successful sign-up", async () => {
      const password = "SecurePassword123!";
      const passwordClientHash = bytesToBase64(await scrypt(password, clientSalt));

      // First request should succeed
      const firstResponse = await testFetch("/auth/sign-up/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          passwordClientHash,
          captcha: "test-captcha-token",
        }),
      });

      expect(firstResponse.status).toBe(201);

      // Second request with same sessionId should fail
      const secondResponse = await testFetch("/auth/sign-up/finish", {
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
      const response = await testFetch("/auth/sign-up/finish", {
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

  describe("Full sign-up flow", () => {
    it("should complete full sign-up flow successfully", async () => {
      const email = "full.flow@example.com";
      const password = "FullFlowPassword123!";

      // Step 1: Start sign-up
      const startResponse = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Full",
          lastName: "Flow",
          email,
          captcha: "test-captcha-token",
        }),
      });

      expect(startResponse.status).toBe(201);

      const startJson = (await startResponse.json()) as Ok<{
        sessionId: string;
        clientSalt: string;
      }>;

      // Step 2: Hash password client-side
      const passwordClientHash = bytesToBase64(
        await scrypt(password, startJson.data!.clientSalt),
      );

      // Step 3: Finish sign-up
      const finishResponse = await testFetch("/auth/sign-up/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: startJson.data!.sessionId,
          passwordClientHash,
          captcha: "test-captcha-token",
        }),
      });

      expect(finishResponse.status).toBe(201);

      // Step 4: Verify user exists and is signed in
      const [user] = await testDatabase
        .select()
        .from(users)
        .where(eq(users.email, email));

      expect(user).toBeDefined();
      expect(user.firstName).toBe("Full");
      expect(user.lastName).toBe("Flow");

      const cookies = finishResponse.headers.get("set-cookie");
      expect(cookies).toContain("access");
      expect(cookies).toContain("refresh");
    });

    it("should prevent double sign-up with same email", async () => {
      const email = "duplicate@example.com";

      // First sign-up
      const firstStart = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "First",
          email,
          captcha: "test-captcha-token",
        }),
      });

      const firstStartJson = (await firstStart.json()) as Ok<{
        sessionId: string;
        clientSalt: string;
      }>;

      const passwordHash = bytesToBase64(
        await scrypt("password123", firstStartJson.data!.clientSalt),
      );

      await testFetch("/auth/sign-up/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: firstStartJson.data!.sessionId,
          passwordClientHash: passwordHash,
          captcha: "test-captcha-token",
        }),
      });

      // Attempt second sign-up with same email
      const secondStart = await testFetch("/auth/sign-up/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Second",
          email,
          captcha: "test-captcha-token",
        }),
      });

      expect(secondStart.status).toBe(400);

      const json = (await secondStart.json()) as Err;

      expect(json.errors!.some((e) => e.path[0] === "email")).toBe(true);
    });
  });
});
