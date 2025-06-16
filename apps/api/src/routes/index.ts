import { app } from "$lib/app";

const routes = app();

routes.get("/", (c) => {
  return c.json({ status: 200, message: "This is the Vendel.dk API" });
});

export { routes };
