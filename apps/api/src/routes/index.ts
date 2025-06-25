import { Ok } from "$lib/types/result";
import { app } from "$lib/utils/app";

import { authRoutes } from "./auth";

const routes = app();

routes.get("/", (c) => {
  return c.json({
    ok: true,
    status: 200,
    message: `Vendel.dk API`,
  } satisfies Ok);
});

routes.route("/auth", authRoutes);

export { routes };
