import { base64urlnopad } from "@scure/base";

import { createClientRoute } from "$lib/client/create-route";
import { getClientUrl } from "$lib/client/utils/get-url";
import { handleApiResponse } from "$lib/client/utils/handle-api-response";
import { scrypt } from "$lib/utils/scrypt";

import type {
  SignUpFinishRequest,
  SignUpStartRequest,
  SignUpStartResponse,
} from "./sign-up";

const createSignUpClient = createClientRoute(({ context, fetch }) => {
  return async function signUp({
    firstName,
    middleName,
    lastName,
    email,
    password,
    captcha,
  }: {
    firstName: string;
    middleName?: string;
    lastName?: string;

    email: string;
    password: string;
    captcha: string;
  }) {
    const startRes = await fetch(getClientUrl(context, "/auth/sign-up/start"), {
      method: "post",
      body: JSON.stringify({
        firstName,
        middleName,
        lastName,
        email,
        captcha,
      } satisfies SignUpStartRequest),
    });

    const startJson = await handleApiResponse<SignUpStartResponse>(startRes);
    if (!startJson.ok || !startJson.data) return startJson;

    const passwordHash = await scrypt(password, startJson.data.clientSalt);

    const finishRes = await fetch(
      getClientUrl(context, "/auth/sign-up/finish"),
      {
        method: "post",
        body: JSON.stringify({
          sessionId: startJson.data.sessionId,
          passwordClientHash: base64urlnopad.encode(passwordHash),
          captcha,
        } satisfies SignUpFinishRequest),
      },
    );

    return await handleApiResponse(finishRes);
  };
});

export { createSignUpClient };
