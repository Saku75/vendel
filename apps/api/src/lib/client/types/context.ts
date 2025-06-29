interface ClientContext {
  prefix?: string;

  headers?: HeadersInit;

  fetch: typeof fetch;
}

export { ClientContext };
