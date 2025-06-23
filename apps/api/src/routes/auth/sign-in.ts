import { z } from "zod";

import { app } from "$lib/utils/app";

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

export { signInRoutes };
export type {
  SignInFinishRequest,
  SignInSession,
  SignInStartRequest,
  SignInStartResponse,
};
