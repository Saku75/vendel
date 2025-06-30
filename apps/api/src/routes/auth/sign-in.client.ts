import { base64urlnopad } from "@scure/base";

import { createClientRoute } from "$lib/client/create-route";
import { getClientUrl } from "$lib/client/utils/get-url";
import { handleApiResponse } from "$lib/client/utils/handle-api-response";

import type {
  SignInFinishRequest,
  SignInStartRequest,
  SignInStartResponse,
} from "./sign-in";
import { scrypt } from "./utils/scrypt";

const createSignInClient = createClientRoute(({ context, fetch }) => {
  return async function signIn(data: {
    email: string;
    password: string;
    captcha: string;
  }) {
    const { email, password, captcha } = data;

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
          passwordClientHash: base64urlnopad.encode(passwordHash),
          captcha,
        } satisfies SignInFinishRequest),
      },
    );

    return await handleApiResponse(finishRes);
  };
});

export { createSignInClient };
