// src/schemas/variant/variant-input.ts
import { z } from "zod";
import { moneySchema } from "../shared/money.schema";

/**
 * CREATE VARIANT INPUT
 * Valida dados de criação de variante
 */
export const CreateVariantInputSchema = z.object({
  productId: z.string().min(1, "productId é obrigatório"),
  weight: z.number().optional(),
  retailPrice: z.union([moneySchema, z.literal("")]).optional(),
  partnerPrice: z.union([moneySchema, z.literal("")]).optional(),
  productImageUrl: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  softDelete: z.boolean().optional().default(false),
  sku: z.string().min(1, "SKU é obrigatório e não pode estar vazio"),
});

export type CreateVariantInputType = z.infer<typeof CreateVariantInputSchema>;