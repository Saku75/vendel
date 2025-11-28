import { defineRoute } from "$lib/client/route";

import { confirmEmailClient } from "./confirm/client";
import { resendConfirmEmailClient } from "./resend/client";

const emailClient = defineRoute((context) => {
  return {
    confirm: confirmEmailClient(context),
    resend: resendConfirmEmailClient(context),
  };
});

export { emailClient };
