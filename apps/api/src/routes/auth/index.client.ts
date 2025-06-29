import { createClientRoute } from "$lib/client/create-route";

import { createSignInClient } from "./sign-in.client";
import { createSignUpClient } from "./sign-up.client";
import { createWhoAmIClient } from "./who-am-i.client";

const createAuthClient = createClientRoute((context, fetch) => {
  return {
    signIn: createSignInClient(context, fetch),
    signUp: createSignUpClient(context, fetch),
    whoAmI: createWhoAmIClient(context, fetch),
  };
});

export { createAuthClient };
