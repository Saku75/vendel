import { defineRoute } from "$lib/client/route";

import { signInClient } from "./sign-in/client";
import { signUpClient } from "./sign-up/client";

const authClient = defineRoute((context) => {
  return {
    signIn: signInClient(context),
    signUp: signUpClient(context),
  };
});

export { authClient };
