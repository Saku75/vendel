import { createClientRoute } from "$lib/client/create-route";

import { createConfirmEmailClient } from "./confirm-email.client";
import { createSignInClient } from "./sign-in.client";
import { createSignOutClient } from "./sign-out.client";
import { createSignUpClient } from "./sign-up.client";
import { createWhoAmIClient } from "./who-am-i.client";

const createAuthClient = createClientRoute((config) => {
  return {
    confirmEmail: createConfirmEmailClient(config),

    signIn: createSignInClient(config),
    signOut: createSignOutClient(config),
    signUp: createSignUpClient(config),

    whoAmI: createWhoAmIClient(config),
  };
});

export { createAuthClient };
