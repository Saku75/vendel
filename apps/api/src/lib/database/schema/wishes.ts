import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { createId } from "@package/crypto-utils/cuid";

import { wishlists } from "./wishlists";

const wishes = sqliteTable("wishes", {
  id: text({ length: 24 })
    .primaryKey()
    .$default(() => createId()),

  wishlistId: text({ length: 24 })
    .notNull()
    .references(() => wishlists.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),

  title: text({ length: 256 }).notNull(),
  brand: text({ length: 128 }),
  description: text({ length: 512 }),
  price: int(),

  url: text({ length: 2048 }),

  createdAt: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export { wishes };
