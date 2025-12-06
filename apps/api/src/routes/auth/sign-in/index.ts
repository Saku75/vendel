import { env } from "cloudflare:workers";

import { createServer } from "$lib/server";
import { createKV } from "$lib/utils/create-kv";

import { signInFinishServer } from "./finish";
import { signInStartServer } from "./start";

const signInServer = createServer();

signInServer.route("/start", signInStartServer);
signInServer.route("/finish", signInFinishServer);

type SignInSession = {
  email: string;
  serverSalt: string;
  captchaIdempotencyKey: string;
};

const signInSessions = createKV<SignInSession>(env.KV, {
  prefix: "auth:sign-in",
});

export { signInServer, signInSessions };
export type { SignInSession };
