// src/schemas/unit/unit-output.ts
import { z } from "zod";

/**
 * POPCORN UNIT OUTPUT
 * Saída detalhada de unidade individual
 */
export const PopcornUnitOutputSchema = z.object({
  id: z.string(),
  batchId: z.string(),
  sold: z.boolean().default(false),
  sku: z.string(),
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  returnReason: z.string().optional(),
  returnDate: z.string().optional(),
  movementStatus: z.enum(["in_stock", "sold", "returned", "discarded"]).default("in_stock"),

  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PopcornUnitOutputType = z.infer<typeof PopcornUnitOutputSchema>;