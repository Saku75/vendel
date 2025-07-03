import { type z } from "zod";

import { app } from "$lib/server";

import { signInFinishRoute, signInFinishSchema } from "./sign-in.finish";
import { signInStartRoute, signInStartSchema } from "./sign-in.start";

const signInRoutes = app();

signInRoutes.route("/start", signInStartRoute);
signInRoutes.route("/finish", signInFinishRoute);

type SignInStartRequest = z.infer<typeof signInStartSchema>;
type SignInStartResponse = { sessionId: string; clientSalt: string };

type SignInFinishRequest = z.infer<typeof signInFinishSchema>;

type SignInSession =
  | {
      userExists: true;

      userId: string;

      serverSalt: string;

      captchaIdempotencyKey: string;
    }
  | {
      userExists: false;

      serverSalt: string;

      captchaIdempotencyKey: string;
    };

function signInSessionKey(sessionId: string) {
  return `auth:sign-in:session:${sessionId}`;
}

export { signInRoutes, signInSessionKey };
export type {
  SignInFinishRequest,
  SignInSession,
  SignInStartRequest,
  SignInStartResponse,
};
