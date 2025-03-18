import { app } from "$lib/app";

import { categoriesRoutes } from "./categories";
import { usersRoutes } from "./users";
import { wishlistsRoutes } from "./wishlists";

const v1Routes = app();

v1Routes.route("/categories", categoriesRoutes);
v1Routes.route("/users", usersRoutes);
v1Routes.route("/wishlists", wishlistsRoutes);

export { v1Routes };
