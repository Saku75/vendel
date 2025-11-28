import { createServer } from "$lib/server";

import { refreshServer } from "./refresh";
import { signInServer } from "./sign-in";
import { signOutServer } from "./sign-out";
import { signUpServer } from "./sign-up";

const authServer = createServer();

authServer.route("/refresh", refreshServer);
authServer.route("/sign-in", signInServer);
authServer.route("/sign-out", signOutServer);
authServer.route("/sign-up", signUpServer);

export { authServer };
