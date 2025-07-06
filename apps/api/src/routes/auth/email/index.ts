import { app } from "$lib/server";

import { emailConfirmRoute } from "./confirm";
import { emailSendRoute } from "./send";

const emailRoutes = app();

emailRoutes.route("/send", emailSendRoute);
emailRoutes.route("/confirm", emailConfirmRoute);

export { emailRoutes };
