import { relations, sql } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { productVariants } from "./product-variants";


export const products = pgTable("products", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  prefix: text("prefix"),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  softDelete: boolean("soft_delete").default(false).notNull(),
  color: text("color"),
  category: text("category"), // Adicionei category para permitir agrupamento e filtros no painel administrativo.

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Produto pode ter várias variantes.
export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants), 
}));
