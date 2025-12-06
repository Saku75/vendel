import { bytesToBase64 } from "@package/crypto-utils/bytes";
import { scrypt } from "@package/crypto-utils/scrypt";

import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";
import type {
  SignUpFinishResponse,
  SignUpRequest,
  SignUpResponse,
  SignUpStartResponse,
} from "$lib/types";

const signUpClient = defineRoute((context) => {
  return async (data: SignUpRequest): Promise<ClientResult<SignUpResponse>> => {
    const startResult = await request<SignUpStartResponse>(
      context,
      "auth/sign-up/start",
      {
        method: "POST",
        json: {
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          email: data.email,
          captcha: data.captcha,
        },
      },
    );

    if (!startResult.ok) {
      return startResult;
    }

    const passwordClientHash = bytesToBase64(
      await scrypt(data.password, startResult.data.clientSalt),
    );

    const finishResult = await request<SignUpFinishResponse>(
      context,
      "auth/sign-up/finish",
      {
        method: "POST",
        json: {
          sessionId: startResult.data.sessionId,
          passwordClientHash,
          captcha: data.captcha,
        },
      },
    );

    return finishResult;
  };
});

export { signUpClient };
