import { object } from "zod";

import { captchaValidator } from "@package/validators/captcha";
import { idValidator } from "@package/validators/id";
import { passwordHashValidator } from "@package/validators/password";

import { createServer } from "$lib/server";
import { response } from "$lib/server/response";

const signUpFinishSchema = object({
  sessionId: idValidator,

  passwordClientHash: passwordHashValidator,

  captcha: captchaValidator,
});

const signUpFinishServer = createServer();

signUpFinishServer.post("/", async (c) => {
  return response(c, { status: 501, content: { message: "Not implemented" } });
});

export { signUpFinishSchema, signUpFinishServer };
