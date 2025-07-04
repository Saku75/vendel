interface ClientContext {
  prefix?: string;

  headers?: HeadersInit;

  fetch: typeof fetch;

  hooks?: {
    afterRequest?: (
      res: Response,
      req: RequestInfo | URL,
      init?: RequestInit,
    ) => void | Promise<void>;
  };
}

export { ClientContext };
