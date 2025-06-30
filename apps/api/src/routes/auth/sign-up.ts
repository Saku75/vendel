import { type z } from "zod";

import { app } from "$lib/utils/app";

import { signUpFinishRoute, signUpFinishSchema } from "./sign-up.finish";
import { signUpStartRoute, signUpStartSchema } from "./sign-up.start";

const signUpRoutes = app();

signUpRoutes.route("/start", signUpStartRoute);
signUpRoutes.route("/finish", signUpFinishRoute);

type SignUpStartRequest = z.infer<typeof signUpStartSchema>;
type SignUpStartResponse = { sessionId: string; clientSalt: string };

type SignUpFinishRequest = z.infer<typeof signUpFinishSchema>;

type SignUpSession = {
  userId: string;

  serverSalt: string;

  captchaIdempotencyKey: string;
};

function signUpSessionKey(sessionId: string) {
  return `auth:sign-up:session:${sessionId}`;
}

export { signUpRoutes, signUpSessionKey };
export type {
  SignUpFinishRequest,
  SignUpSession,
  SignUpStartRequest,
  SignUpStartResponse,
};
