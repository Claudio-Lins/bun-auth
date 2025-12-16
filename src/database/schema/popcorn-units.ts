import { randomUUIDv7 } from "bun";
import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { batches } from "./batches";
import { eventUnits } from "./event-units";


export const popcornUnits = pgTable("popcorn_units", {
  id: text("id").primaryKey().$defaultFn(() => randomUUIDv7()),
  batchId: text("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  sold: boolean("sold").default(false).notNull(),
  // productVariantId: text("product_variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
  sku: text("sku").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  returnReason: text("return_reason"),
  returnDate: timestamp("return_date"),
  movementStatus: text("movement_status").notNull().default("in_stock"), // valores possíveis: "in_stock", "sold", "returned", "discarded"

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => ({
  // Melhora consultas de unidades pertencentes a um lote.
  popcornUnitsBatchIdx: index("popcorn_units_batch_id_idx").on(table.batchId),
  // Acelera rastreio de unidade individual por SKU.
  popcornUnitsSkuIdx: index("popcorn_units_sku_idx").on(table.sku),
  // Acelera consultas de unidades disponíveis/indisponíveis/vendidas.
  popcornUnitsStatusIdx: index("popcorn_units_status_idx").on(table.sold, table.isAvailable),
}));


// Unidade ligada ao lote e opcionalmente à variante diretamente.
export const popcornUnitsRelations = relations(popcornUnits, ({ one, many }) => ({
  batch: one(batches, {
    fields: [popcornUnits.batchId],
    references: [batches.id],
  }),
  
  // Adicionar relacionamento com eventos
  eventAllocations: many(eventUnits), // popcorn_unit → muitas event_units
}));
