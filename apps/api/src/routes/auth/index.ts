import { app } from "$lib/server";

import { signInRoutes } from "./sign-in";
import { signUpRoutes } from "./sign-up";
import { whoAmIRoute } from "./who-am-i";

const authRoutes = app();

authRoutes.route("/sign-in", signInRoutes);
authRoutes.route("/sign-up", signUpRoutes);
authRoutes.route("/whoami", whoAmIRoute);

export { authRoutes };
