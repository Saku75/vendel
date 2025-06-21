import { scryptAsync } from "@noble/hashes/scrypt";
import { base64urlnopad } from "@scure/base";
import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { describe, expect, it } from "vitest";

import { users } from "$lib/database/schema/users";
import { testFetch } from "$lib/test/utils/fetch";

import {
  SignUpFinishRequest,
  SignUpStartRequest,
  SignUpStartResponse,
} from "./sign-up";

describe("Auth: Sign Up", () => {
  const currentTime = Date.now();
  const database = drizzle(env.DB, { casing: "snake_case" });

  it("should be able to sign up", async () => {
    const signUpStartRequest: SignUpStartRequest = {
      firstName: `Test ${currentTime}`,
      email: `test-${currentTime}@vendel.dk`,
    };

    const signUpStartResponse = await testFetch("/auth/sign-up/start", {
      method: "POST",
      body: JSON.stringify(signUpStartRequest),
    });

    expect(signUpStartResponse.status).toBe(201);

    const signUpStart = await signUpStartResponse.json<{
      status: number;
      data: SignUpStartResponse;
    }>();

    const { data: signUpStartData } = signUpStart;

    expect(signUpStartData.sessionId).toBeDefined();
    expect(signUpStartData.clientSalt).toBeDefined();

    const passwordClientHash = await scryptAsync(
      "test@1234!",
      signUpStartData.clientSalt,
      { N: 2 ** 17, r: 8, p: 1 },
    );

    const signUpFinishRequest: SignUpFinishRequest = {
      sessionId: signUpStartData.sessionId,
      passwordClientHash: base64urlnopad.encode(passwordClientHash),
    };

    const signUpFinishResponse = await testFetch("/auth/sign-up/finish", {
      method: "POST",
      body: JSON.stringify(signUpFinishRequest),
    });

    expect(signUpFinishResponse.status).toBe(201);

    const { data: signUpFinishData } = signUpStart;

    expect(signUpFinishData.sessionId).toBeDefined();

    expect(
      await database.$count(users, eq(users.email, signUpStartRequest.email)),
    );
  });
});
