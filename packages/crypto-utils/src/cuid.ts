import type { createId as cuid2CreateId } from "@paralleldrive/cuid2";

function createId(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createId: internalCreateId } = require("@paralleldrive/cuid2") as {
    createId: typeof cuid2CreateId;
  };
  return internalCreateId();
}

export { createId };
