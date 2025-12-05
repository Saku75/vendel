import type { z } from "zod/mini";

import type { signUpFinishSchema } from "$routes/auth/sign-up/finish";
import type { signUpStartSchema } from "$routes/auth/sign-up/start";

type SignUpStartRequest = z.infer<typeof signUpStartSchema>;
type SignUpStartResponse = { sessionId: string; clientSalt: string };

type SignUpFinishRequest = z.infer<typeof signUpFinishSchema>;
type SignUpFinishResponse = undefined;

type SignUpRequest = SignUpStartRequest & {
  password: string;
};
type SignUpResponse = SignUpFinishResponse;

export type {
  SignUpFinishRequest,
  SignUpFinishResponse,
  SignUpRequest,
  SignUpResponse,
  SignUpStartRequest,
  SignUpStartResponse,
};
