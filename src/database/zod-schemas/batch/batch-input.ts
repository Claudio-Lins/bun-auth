// src/schemas/batch/batch-input.ts
import { z } from "zod";

/**
 * CREATE BATCH INPUT
 * Valida dados de criação de lote
 */
export const CreateBatchInputSchema = z.object({
  name: z.string(),
  variantId: z.string(),
  productionDate: z.string(),
  expirationDate: z.string(),
  quantity: z.number().int(),
  batchCode: z.string().optional(),
  createUnits: z.boolean().optional().default(true), // Se true, cria unidades automaticamente
});

export const SellBatchUnitsInputSchema = z.object({
  quantity: z.number().int().positive("Quantidade deve ser maior que zero"),
});

export type CreateBatchInputType = z.infer<typeof CreateBatchInputSchema>;
export type SellBatchUnitsInputType = z.infer<typeof SellBatchUnitsInputSchema>;