import { app } from "$lib/utils/app";

const routes = app();

routes.get("/", (c) => {
  return c.json({
    status: 200,
    message: `Vendel.dk API`,
  });
});

export { routes };
