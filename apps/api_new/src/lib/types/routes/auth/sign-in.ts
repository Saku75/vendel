import type { z } from "zod";

import type { signInFinishSchema } from "$routes/auth/sign-in/finish";
import type { signInStartSchema } from "$routes/auth/sign-in/start";

type SignInStartRequest = z.infer<typeof signInStartSchema>;
type SignInStartResponse = { sessionId: string; clientSalt: string };

type SignInFinishRequest = z.infer<typeof signInFinishSchema>;
type SignInFinishResponse = undefined;

type SignInRequest = SignInStartRequest & {
  password: string;
};
type SignInResponse = SignInFinishResponse;

export type {
  SignInFinishRequest,
  SignInFinishResponse,
  SignInRequest,
  SignInResponse,
  SignInStartRequest,
  SignInStartResponse,
};
