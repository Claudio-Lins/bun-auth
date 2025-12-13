// src/schemas/unit/unit-input.ts
import { z } from "zod";

/**
 * CREATE UNIT INPUT
 * Valida dados de criação de unidade individual
 */
export const CreatePopcornUnitInputSchema = z.object({
  batchId: z.string(),
  sku: z.string().min(2, "SKU muito curto."),
  isActive: z.boolean().optional().default(true),
  isAvailable: z.boolean().optional().default(true),
  movementStatus: z.enum(["in_stock", "sold", "returned", "discarded"]).optional().default("in_stock"),
});

export const UpdatePopcornUnitInputSchema = z.object({
  batchId: z.string().optional(),
  sku: z.string().min(2, "SKU muito curto.").optional(),
  sold: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  returnReason: z.string().optional(),
  returnDate: z.string().optional(),
  movementStatus: z.enum(["in_stock", "sold", "returned", "discarded"]).optional(),
});

export type CreatePopcornUnitInputType = z.infer<typeof CreatePopcornUnitInputSchema>;
export type UpdatePopcornUnitInputType = z.infer<typeof UpdatePopcornUnitInputSchema>;