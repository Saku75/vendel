import { object } from "zod";

import { captchaValidator } from "@package/validators/captcha";
import { emailValidator } from "@package/validators/email";
import {
  firstNameValidator,
  lastNameValidator,
  middleNameValidator,
} from "@package/validators/name";

import { createServer } from "$lib/server";
import { response } from "$lib/server/response";

const signUpStartSchema = object({
  firstName: firstNameValidator,
  middleName: middleNameValidator,
  lastName: lastNameValidator,

  email: emailValidator,

  captcha: captchaValidator,
});

const signUpStartServer = createServer();

signUpStartServer.post("/", async (c) => {
  return response(c, { status: 501, content: { message: "Not implemented" } });
});

export { signUpStartSchema, signUpStartServer };
