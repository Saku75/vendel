import { ApiResponse } from "$lib/types/response";
import { app } from "$lib/utils/app";

import { authRoutes } from "./auth";

const routes = app();

routes.get("/", (c) => {
  return c.json({
    status: 200,
    message: `Vendel.dk API`,
  } satisfies ApiResponse);
});

routes.route("/auth", authRoutes);

export { routes };
