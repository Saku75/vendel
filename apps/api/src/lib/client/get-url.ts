import { ClientContext } from "./context";

function getClientUrl(path: string, ctx?: ClientContext) {
  const url: string[] = [];

  if (ctx?.domain) url.push(ctx.domain);
  if (ctx?.prefix) url.push(ctx.prefix);

  url.push(path);

  return url.join("");
}

export { getClientUrl };
