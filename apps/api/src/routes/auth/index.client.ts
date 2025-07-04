import { createClientRoute } from "$lib/client/create-route";

import { createSignInClient } from "./sign-in.client";
import { createSignOutClient } from "./sign-out.client";
import { createSignUpClient } from "./sign-up.client";
import { createWhoAmIClient } from "./who-am-i.client";

const createAuthClient = createClientRoute((config) => {
  return {
    signIn: createSignInClient(config),
    signOut: createSignOutClient(config),
    signUp: createSignUpClient(config),
    whoAmI: createWhoAmIClient(config),
  };
});

export { createAuthClient };
