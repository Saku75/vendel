import { createServer } from "$lib/server";

import { signInServer } from "./sign-in";
import { signUpServer } from "./sign-up";

const authServer = createServer();

authServer.route("/sign-in", signInServer);
authServer.route("/sign-up", signUpServer);

export { authServer };
