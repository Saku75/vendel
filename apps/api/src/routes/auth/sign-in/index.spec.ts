import { beforeEach, describe, expect, it } from "vitest";

import { bytesToBase64 } from "@package/crypto-utils/bytes";
import { scrypt } from "@package/crypto-utils/scrypt";

import type {
  SignInFinishResponse,
  SignInStartResponse,
  SignUpStartResponse,
} from "$lib/types";
import type { Err, Ok } from "$lib/types/result";

import { testUsers } from "$test/fixtures/users";
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

      const json = await response.json<Ok<SignInStartResponse>>();

      expect(json.status).toBe(200);
      expect(json.data).toBeDefined();
      expect(json.data.sessionId).toMatch(/^[a-z0-9]{24}$/);
      expect(json.data.clientSalt).toMatch(/^[a-f0-9]{64}$/);
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

      expect(response.status).toBe(200);

      const json = await response.json<Ok<SignInStartResponse>>();

      expect(json.status).toBe(200);
      expect(json.data).toBeDefined();
      expect(json.data.sessionId).toMatch(/^[a-z0-9]{24}$/);
      expect(json.data.clientSalt).toMatch(/^[a-f0-9]{64}$/);
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

      const json = await response.json<Err>();

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
        }),
      });

      expect(response.status).toBe(400);

      const json = await response.json<Err>();

      expect(json.status).toBe(400);
      expect(json.errors).toBeDefined();
      expect(json.errors!.some((e) => e.path[0] === "email")).toBe(true);
    });
  });

  describe("POST /auth/sign-in/finish", () => {
    let sessionId: string;
    let clientSalt: string;

    beforeEach(async () => {
      const startResponse = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUsers.UserOne.email,
          captcha: "test-captcha-token",
        }),
      });

      const startJson = await startResponse.json<Ok<SignInStartResponse>>();

      sessionId = startJson.data.sessionId;
      clientSalt = startJson.data.clientSalt;
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

      const json = await response.json<Ok<SignInFinishResponse>>();

      expect(json.status).toBe(200);
      expect(json.message).toBe("User signed in");

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

      const json = await response.json<Err>();

      expect(json.status).toBe(401);
      expect(json.message).toBe("Invalid email or password");
      expect(json.errors).toBeUndefined();
    });

    it("should return generic error for non-existent user", async () => {
      const startResponse = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          captcha: "test-captcha-token",
        }),
      });

      const startJson = await startResponse.json<Ok<SignInStartResponse>>();

      const passwordClientHash = bytesToBase64(
        await scrypt("SomePassword123!", startJson.data.clientSalt),
      );

      const response = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: startJson.data.sessionId,
          passwordClientHash,
          captcha: "test-captcha-token",
        }),
      });

      expect(response.status).toBe(401);

      const json = await response.json<Err>();

      expect(json.status).toBe(401);
      expect(json.message).toBe("Invalid email or password");
      expect(json.errors).toBeUndefined();
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

      const json = await response.json<Err>();

      expect(json.status).toBe(400);
      expect(json.errors).toBeDefined();
      expect(json.errors!.some((e) => e.path[0] === "sessionId")).toBe(true);
    });

    it("should delete session after successful sign-in", async () => {
      const password = testUsers.UserOne.password;
      const passwordClientHash = bytesToBase64(
        await scrypt(password, clientSalt),
      );

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

      const json = await secondResponse.json<Err>();

      expect(json.status).toBe(400);
      expect(json.errors!.some((e) => e.path[0] === "sessionId")).toBe(true);
    });

    it("should delete session even after failed attempt", async () => {
      const wrongPassword = "WrongPassword123!";
      const passwordClientHash = bytesToBase64(
        await scrypt(wrongPassword, clientSalt),
      );

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

      const json = await secondResponse.json<Err>();

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
        }),
      });

      expect(response.status).toBe(400);

      const json = await response.json<Err>();

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

      const startResponse = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          captcha: "test-captcha-token",
        }),
      });

      expect(startResponse.status).toBe(200);

      const startJson = await startResponse.json<Ok<SignInStartResponse>>();

      const passwordClientHash = bytesToBase64(
        await scrypt(password, startJson.data.clientSalt),
      );

      const finishResponse = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: startJson.data.sessionId,
          passwordClientHash,
          captcha: "test-captcha-token",
        }),
      });

      expect(finishResponse.status).toBe(200);

      const cookies = finishResponse.headers.get("set-cookie");
      expect(cookies).toContain("access");
      expect(cookies).toContain("refresh");
    });

    it("should work for newly signed up user", async () => {
      const email = "newsignin@example.com";
      const password = "NewSignInPassword123!";

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

      const signUpStartJson = await signUpStart.json<Ok<SignUpStartResponse>>();

      const signUpPasswordHash = bytesToBase64(
        await scrypt(password, signUpStartJson.data.clientSalt),
      );

      await testFetch("/auth/sign-up/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: signUpStartJson.data.sessionId,
          passwordClientHash: signUpPasswordHash,
          captcha: "test-captcha-token",
        }),
      });

      const signInStart = await testFetch("/auth/sign-in/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          captcha: "test-captcha-token",
        }),
      });

      const signInStartJson = await signInStart.json<Ok<SignInStartResponse>>();

      const signInPasswordHash = bytesToBase64(
        await scrypt(password, signInStartJson.data.clientSalt),
      );

      const signInFinish = await testFetch("/auth/sign-in/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: signInStartJson.data.sessionId,
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
