import { randomUUIDv7 } from "bun";
import { relations } from "drizzle-orm";
import { index, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { popcornUnits } from "./popcorn-units";
import { productVariants } from "./product-variants";


export const batches = pgTable("batches", {
  id: text("id").primaryKey().$defaultFn(() => randomUUIDv7()),
  name: text("name").notNull(),
  productVariantId: text("product_variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
  productionDate: timestamp("production_date").notNull(),
  expirationDate: timestamp("expiration_date").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 0 }).notNull(),
  batchCode: text("batch_code"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => ({
  // Essencial para dashboards que exibem lotes por variante.
  batchesVariantIdx: index("batches_product_variant_id_idx").on(table.productVariantId),
  // Acelera listagem por data (muito comum em estoque).
  batchesProductionDateIdx: index("batches_production_date_idx").on(table.productionDate),
}));


// Cada lote pertence a uma variante, e tem várias unidades.
export const batchesRelations = relations(batches, ({ one, many }) => ({
  variant: one(productVariants, {
    fields: [batches.productVariantId],
    references: [productVariants.id],
  }),

  units: many(popcornUnits),
}));

// Comentário: