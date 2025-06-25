import { scryptAsync } from "@noble/hashes/scrypt";
import { base64urlnopad } from "@scure/base";

import { createClientRoute } from "$lib/client/create-route";
import { getClientUrl } from "$lib/client/get-url";
import { handleApiResponse } from "$lib/client/handle-response";

import type {
  SignInFinishRequest,
  SignInStartRequest,
  SignInStartResponse,
} from "./sign-in";

const createSignInClient = createClientRoute((ky, ctx) => {
  return async function signIn(data: {
    email: string;
    password: string;
    captcha: string;
  }) {
    const { email, password, captcha } = data;

    const startRes = await ky.post(getClientUrl("/auth/sign-in/start", ctx), {
      json: { email, captcha } satisfies SignInStartRequest,
    });

    const startJson = await handleApiResponse<SignInStartResponse>(startRes);
    if (!startJson.ok || !startJson.data) return startJson;

    const passwordHash = await scryptAsync(
      password,
      startJson.data.clientSalt,
      {
        N: 2 ** 17,
        r: 8,
        p: 1,
        dkLen: 256,
      },
    );

    const finishRes = await ky.post(getClientUrl("/auth/sign-in/finish", ctx), {
      json: {
        sessionId: startJson.data.sessionId,
        passwordClientHash: base64urlnopad.encode(passwordHash),
        captcha,
      } satisfies SignInFinishRequest,
    });

    return await handleApiResponse(finishRes);
  };
});

export { createSignInClient };
