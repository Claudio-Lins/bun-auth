
import { relations, sql } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userContacts = pgTable("user_contacts", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  phone: text("phone").notNull(),
  countryCode: text("country_code").default("351"),
  isPrimary: boolean("is_primary").default(false).notNull(),
  verified: boolean("verified").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  userContactsUserIdx: index("user_contacts_user_id_idx").on(table.userId),
}));

export const userContactsRelations = relations(userContacts, ({ one }) => ({
  user: one(users, {
    fields: [userContacts.userId],
    references: [users.id],
  }),
}));
