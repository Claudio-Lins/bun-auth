import { randomUUIDv7 } from "bun";
import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { userAddresses } from "./user-addresses";
import { userContacts } from "./user-contacts";

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => randomUUIDv7()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("user"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  contacts: many(userContacts),
  addresses: many(userAddresses),
}));