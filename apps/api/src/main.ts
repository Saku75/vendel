import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { trimTrailingSlash } from "hono/trailing-slash";

import { app } from "$lib/app";

const api = app();

api.use(
  cors({
    origin: (origin) =>
      /((.*\.)?vendel\.dk|localhost(:\d{1,5}?))$/.test(origin)
        ? origin
        : "https://vendel.dk",
  }),
  csrf(),
  trimTrailingSlash(),
  contextStorage(),
);

api.get("/", (c) => c.text("Vendel.dk"));

export default {
  async fetch(request: Request, env: WorkerEnv, context: ExecutionContext) {
    const url = new URL(request.url);

    const pathPrefix = !/(api\.(dev\.)?vendel\.dk|localhost(:\d{1,5}?))$/.test(
      url.host,
    )
      ? "/api"
      : "";

    const server = app().basePath(pathPrefix).route("/", api);

    return await server.fetch(request);
  },
};
