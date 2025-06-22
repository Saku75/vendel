import { app } from "$lib/utils/app";

import { signInRoutes } from "./sign-in";
import { signUpRoutes } from "./sign-up";

const authRoutes = app();

authRoutes.route("/sign-in", signInRoutes);
authRoutes.route("/sign-up", signUpRoutes);

export { authRoutes };
