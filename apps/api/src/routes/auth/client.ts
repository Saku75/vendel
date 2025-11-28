import { defineRoute } from "$lib/client/route";

import { refreshClient } from "./refresh/client";
import { signInClient } from "./sign-in/client";
import { signOutClient } from "./sign-out/client";
import { signUpClient } from "./sign-up/client";

const authClient = defineRoute((context) => {
  return {
    refresh: refreshClient(context),
    signIn: signInClient(context),
    signOut: signOutClient(context),
    signUp: signUpClient(context),
  };
});

export { authClient };
