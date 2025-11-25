import { env } from "cloudflare:workers";

import { createServer } from "$lib/server";
import { createKV } from "$lib/utils/create-kv";

import { signUpFinishServer } from "./finish";
import { signUpStartServer } from "./start";

const signUpServer = createServer();

signUpServer.route("/start", signUpStartServer);
signUpServer.route("/finish", signUpFinishServer);

type SignUpSession = {
  userId: string;

  serverSalt: string;

  captchaIdempotencyKey: string;
};

const signUpSessions = createKV<SignUpSession>(env.KV, {
  prefix: "auth:sign-up",
});

export { signUpServer, signUpSessions };
