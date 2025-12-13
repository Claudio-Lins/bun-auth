// src/schemas/product/product-output.ts
import { z } from "zod";

/**
 * PRODUCT OUTPUT 
 * Inclui variantes + agregados de stock
 */
export const ProductOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().nullable(),
  description: z.string().nullable(),
  isActive: z.boolean().default(true),
  softDelete: z.boolean().default(false),
  color: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),

  variants: z.array(
    z.object({
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
    })
  ).optional(),
});

export type ProductOutputType = z.infer<typeof ProductOutputSchema>;