interface ClientContext {
  domain?: string;
  prefix?: string;

  apiKey?: string;

  fetch?: typeof fetch;
}

export { ClientContext };
