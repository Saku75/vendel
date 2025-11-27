import { bytesToBase64 } from "@package/crypto-utils/bytes";
import { scrypt } from "@package/crypto-utils/scrypt";

import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";
import type {
  SignInFinishResponse,
  SignInRequest,
  SignInResponse,
  SignInStartResponse,
} from "$lib/types/routes/auth/sign-in";

const signInClient = defineRoute((context) => {
  return async (data: SignInRequest): Promise<ClientResult<SignInResponse>> => {
    const startResult = await request<SignInStartResponse>(
      context,
      "/auth/sign-in/start",
      {
        method: "POST",
        json: {
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

    const finishResult = await request<SignInFinishResponse>(
      context,
      "/auth/sign-in/finish",
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

export { signInClient };
