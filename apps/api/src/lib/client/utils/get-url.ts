import { ClientContext } from "../types/context";

function getClientUrl(context: ClientContext, path: string): string {
  const prefix = context.prefix ?? "";
  return `${prefix}${path}`;
}

export { getClientUrl };
