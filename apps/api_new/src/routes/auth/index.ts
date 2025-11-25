import { createServer } from "$lib/server";

import { signUpServer } from "./sign-up";

const authServer = createServer();

authServer.route("/sign-up", signUpServer);

export { authServer };
