import { createClientRoute } from "$lib/client/create-route";

import { createSignInClient } from "./sign-in.client";
import { createSignUpClient } from "./sign-up.client";
import { createWhoAmIClient } from "./who-am-i.client";

const createAuthClient = createClientRoute((_, ctx) => {
  return {
    signIn: createSignInClient(ctx),
    signUp: createSignUpClient(ctx),
    whoAmI: createWhoAmIClient(ctx),
  };
});

export { createAuthClient };
