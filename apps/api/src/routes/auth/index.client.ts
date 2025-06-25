import { createClientRoute } from "$lib/client/create-route";

import { createSignInClient } from "./sign-in.client";
import { createSignUpClient } from "./sign-up.client";

const createAuthClient = createClientRoute((_, ctx) => {
  return {
    signIn: createSignInClient(ctx),
    signUp: createSignUpClient(ctx),
  };
});

export { createAuthClient };
