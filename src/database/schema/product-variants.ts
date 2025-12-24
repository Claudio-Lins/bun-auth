import { relations, sql } from "drizzle-orm";
import { boolean, decimal, index, integer, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { batches } from "./batches";
import { popcornUnits } from "./popcorn-units";
import { products } from "./products";


export const productVariants = pgTable("product_variants", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  weight: integer("weight"),
  retailPrice: decimal("retail_price", { precision: 10, scale: 2 }),
  partnerPrice: decimal("partner_price", { precision: 10, scale: 2 }),
  productImageUrl: text("product_image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  softDelete: boolean("soft_delete").default(false).notNull(),
  sku: text("sku").notNull(),
  // color: text("color"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => ({
  // Índice para acelerar consultas de variantes de um produto específico.
  productVariantsProductIdIdx: index("product_variants_product_id_idx").on(table.productId),
  // Garantir busca rápida por SKU associado a uma variante.
  productVariantsSkuIdx: index("product_variants_sku_idx").on(table.sku),
}));


// Permite consultar produto, lotes e unidades direto da variant.
export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),

  batches: many(batches), // variante → muitos lotes
  units: many(popcornUnits), // variante → muitas unidades (se mantiver variantId)
}));
