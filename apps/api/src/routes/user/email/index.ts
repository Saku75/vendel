import { createServer } from "$lib/server";

import { confirmEmailServer } from "./confirm";
import { resendConfirmEmailServer } from "./resend";

const emailServer = createServer();

emailServer.route("/confirm", confirmEmailServer);
emailServer.route("/resend", resendConfirmEmailServer);

export { emailServer };
