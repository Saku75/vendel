import { base64urlnopad } from "@scure/base";

import { createClientRoute } from "$lib/client/create-route";
import { getClientUrl } from "$lib/client/get-url";
import { handleApiResponse } from "$lib/client/handle-response";

import type {
  SignUpFinishRequest,
  SignUpStartRequest,
  SignUpStartResponse,
} from "./sign-up";
import { scrypt } from "./utils/scrypt";

const createSignUpClient = createClientRoute((ky, ctx) => {
  return async function signUp(data: {
    firstName: string;
    middleName?: string;
    lastName?: string;

    email: string;
    password: string;
    captcha: string;
  }) {
    const { firstName, middleName, lastName, email, password, captcha } = data;

    const startRes = await ky.post(getClientUrl("/auth/sign-in/start", ctx), {
      json: {
        firstName,
        middleName,
        lastName,
        email,
        captcha,
      } satisfies SignUpStartRequest,
    });

    const startJson = await handleApiResponse<SignUpStartResponse>(startRes);
    if (!startJson.ok || !startJson.data) return startJson;

    const passwordHash = await scrypt(password, startJson.data.clientSalt);

    const finishRes = await ky.post(getClientUrl("/auth/sign-in/finish", ctx), {
      json: {
        sessionId: startJson.data.sessionId,
        passwordClientHash: base64urlnopad.encode(passwordHash),
        captcha,
      } satisfies SignUpFinishRequest,
    });

    return await handleApiResponse(finishRes);
  };
});

export { createSignUpClient };
