import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { createId } from "@package/crypto-utils/cuid";

const wishlists = sqliteTable("wishlists", {
  id: text({ length: 24 })
    .primaryKey()
    .$default(() => createId()),

  name: text({ length: 128 }).notNull(),
  description: text({ length: 256 }),

  wishesUpdatedAt: int({ mode: "timestamp" }),

  createdAt: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export { wishlists };
