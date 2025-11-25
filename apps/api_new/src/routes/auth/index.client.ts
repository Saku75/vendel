import { defineRoute } from "$lib/client/route";

import { signUpClient } from "./sign-up/client";

const authClient = defineRoute((context) => {
  return {
    signUp: signUpClient(context),
  };
});

export { authClient };
