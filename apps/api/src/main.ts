import { showRoutes } from "hono/dev";

import { app } from "$lib/app";

import { routes } from "./routes";

export default {
  async fetch(request: Request, env: WorkerEnv, context: ExecutionContext) {
    const url = new URL(request.url);

    const pathPrefix = !/(api\.(dev\.)?vendel\.dk|localhost(:\d{1,5}?))$/.test(
      url.host,
    )
      ? "/api"
      : "/";

    const server = app();

    server.route(pathPrefix, routes);

    showRoutes(server);

    return await server.fetch(request, env, context);
  },
};
