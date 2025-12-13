// src/schemas/variant/variant-output.ts
import { z } from "zod";

/**
 * VARIANT OUTPUT
 * Inclui lotes + agregados de stock
 */
export const VariantOutputSchema = z.object({
  id: z.string(),
  productId: z.string(),
  weight: z.number().nullable(),
  retailPrice: z.string().nullable(),
  partnerPrice: z.string().nullable(),
  productImageUrl: z.string().nullable(),
  isActive: z.boolean(),
  softDelete: z.boolean(),
  sku: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),

  batches: z.array(
    z.object({
      id: z.string(),
      quantity: z.number(),
      unitCost: z.number().optional(),
      productionType: z.enum(["FRESH", "STOCK", "CUSTOM"]),
      producedAt: z.string(),
      units: z.object({
        inStock: z.number(),
        sold: z.number(),
        returned: z.number(),
        discarded: z.number(),
        total: z.number(),
      }),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
  ).optional(),
});

export type VariantOutputType = z.infer<typeof VariantOutputSchema>;