import { createClientRoute } from "$lib/client/create-route";

import { createEmailConfirmClient } from "./confirm.client";
import { createEmailSendClient } from "./send.client";

const createEmailClient = createClientRoute((config) => {
  return {
    send: createEmailSendClient(config),
    confirm: createEmailConfirmClient(config),
  };
});

export { createEmailClient };
