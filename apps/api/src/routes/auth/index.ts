import { app } from "$lib/server";

import { confirmEmailRoute } from "./confirm-email";
import { signInRoutes } from "./sign-in";
import { signOutRoute } from "./sign-out";
import { signUpRoutes } from "./sign-up";
import { whoAmIRoute } from "./who-am-i";

const authRoutes = app();

authRoutes.route("/confirm-email", confirmEmailRoute);
authRoutes.route("/sign-in", signInRoutes);
authRoutes.route("/sign-out", signOutRoute);
authRoutes.route("/sign-up", signUpRoutes);
authRoutes.route("/whoami", whoAmIRoute);

export { authRoutes };
