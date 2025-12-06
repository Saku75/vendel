import { parseString } from "set-cookie-parser";

import { bytesToBase64 } from "@package/crypto-utils/bytes";
import { scrypt } from "@package/crypto-utils/scrypt";

import type { SignInStartResponse } from "$lib/types";
import type { Ok } from "$lib/types/result";

import type { TestUser } from "../types/user";
import { testFetch } from "./fetch";

async function signInAs(user: TestUser): Promise<string> {
  const signInStart = await testFetch("/auth/sign-in/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      captcha: "test-captcha-token",
    }),
  });

  const signInStartJson = await signInStart.json<Ok<SignInStartResponse>>();

  const passwordClientHash = bytesToBase64(
    await scrypt(user.password, signInStartJson.data.clientSalt),
  );

  const signInFinish = await testFetch("/auth/sign-in/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: signInStartJson.data.sessionId,
      passwordClientHash,
      captcha: "test-captcha-token",
    }),
  });

  const setCookies = signInFinish.headers.getSetCookie();
  const cookieHeader = setCookies
    .map((cookie) => {
      const parsed = parseString(cookie);
      return `${parsed.name}=${parsed.value}`;
    })
    .filter((cookie) => !cookie.endsWith("="))
    .join("; ");

  return cookieHeader;
}

async function createAuthenticatedFetch(user: TestUser) {
  const cookieHeader = await signInAs(user);

  return function authenticatedFetch(input: string, init?: RequestInit) {
    return testFetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        Cookie: cookieHeader,
      },
    });
  };
}

export { createAuthenticatedFetch, signInAs };
