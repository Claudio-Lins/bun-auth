// src/schemas/batch/batch-output.ts
import { z } from "zod";

/**
 * BATCH OUTPUT
 * Inclui resumo de unidades por status
 */
export const BatchOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  productVariantId: z.string(),
  productionDate: z.string(),
  expirationDate: z.string(),
  quantity: z.string(), // numeric retorna string
  batchCode: z.string().nullable(),

  unitsSummary: z.object({
    inStock: z.number(),
    sold: z.number(),
    returned: z.number(),
    discarded: z.number(),
    total: z.number(),
  }).optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BatchOutputType = z.infer<typeof BatchOutputSchema>;