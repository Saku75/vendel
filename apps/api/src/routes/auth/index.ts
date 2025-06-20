import { app } from "$lib/utils/app";

import { signUpRoutes } from "./sign-up";

const authRoutes = app();

authRoutes.route("/sign-up", signUpRoutes);

export { authRoutes };
