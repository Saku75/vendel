import { defineRoute } from "$lib/client/route";

import { emailClient } from "./email/client";
import { whoAmIClient } from "./who-am-i/client";

const userClient = defineRoute((context) => {
  return {
    email: emailClient(context),
    whoAmI: whoAmIClient(context),
  };
});

export { userClient };
