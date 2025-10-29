function createId(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createId: cuid2CreateId } = require("@paralleldrive/cuid2");
  return cuid2CreateId();
}

export { createId };
