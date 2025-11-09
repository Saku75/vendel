import { bytesToBase64 } from "@package/crypto-utils/bytes";
import { scrypt } from "@package/crypto-utils/scrypt";

import { createClientRoute } from "$lib/client/create-route";
import { getClientUrl } from "$lib/client/utils/get-url";
import { handleApiResponse } from "$lib/client/utils/handle-api-response";

import type {
  SignInFinishRequest,
  SignInStartRequest,
  SignInStartResponse,
} from "./sign-in";

const createSignInClient = createClientRoute(({ context, fetch }) => {
  return async function signIn({
    email,
    password,
    captcha,
  }: {
    email: string;
    password: string;
    captcha: string;
  }) {
    const startRes = await fetch(getClientUrl(context, "/auth/sign-in/start"), {
      method: "post",
      body: JSON.stringify({ email, captcha } satisfies SignInStartRequest),
    });

    const startJson = await handleApiResponse<SignInStartResponse>(startRes);
    if (!startJson.ok || !startJson.data) return startJson;

    const passwordHash = await scrypt(password, startJson.data.clientSalt);

    const finishRes = await fetch(
      getClientUrl(context, "/auth/sign-in/finish"),
      {
        method: "post",
        body: JSON.stringify({
          sessionId: startJson.data.sessionId,
          passwordClientHash: bytesToBase64(passwordHash),
          captcha,
        } satisfies SignInFinishRequest),
      },
    );

    return await handleApiResponse(finishRes);
  };
});

export { createSignInClient };
