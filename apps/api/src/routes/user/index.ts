import { createServer } from "$lib/server";

import { emailServer } from "./email";
import { whoAmIServer } from "./who-am-i";

const userServer = createServer();

userServer.route("/email", emailServer);
userServer.route("/who-am-i", whoAmIServer);

export { userServer };
