import { createClientRoute } from "$lib/client/create-route";

import { createEmailClient } from "./email/index.client";
import { createRefreshClient } from "./refresh.client";
import { createSignInClient } from "./sign-in.client";
import { createSignOutClient } from "./sign-out.client";
import { createSignUpClient } from "./sign-up.client";
import { createWhoAmIClient } from "./who-am-i.client";

const createAuthClient = createClientRoute((config) => {
  return {
    signIn: createSignInClient(config),
    signOut: createSignOutClient(config),
    signUp: createSignUpClient(config),

    refresh: createRefreshClient(config),
    whoAmI: createWhoAmIClient(config),
    email: createEmailClient(config),
  };
});

export { createAuthClient };
