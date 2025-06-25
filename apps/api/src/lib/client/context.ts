interface ClientContext {
  domain?: string;
  prefix?: string;

  fetch?: typeof fetch;
}

export { ClientContext };
