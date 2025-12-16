// src/schemas/product/product-input.ts
import { z } from "zod";

/**
 * CREATE PRODUCT INPUT
 * Valida os dados de criação de produto
 */
export const CreateProductInputSchema = z.object({
  prefix: z.string().min(2, "Prefixo muito curto."),
  name: z.string().min(2, "Nome muito curto."),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  softDelete: z.boolean().optional().default(false),
  color: z.string().default("#FFFFFF"),
  category: z.string().optional().default("Pipoca"),
});

export const UpdateProductInputSchema = z.object({
  id: z.string(),
  prefix: z.string().min(2, "Prefixo muito curto.").optional(),
  name: z.string().min(2, "Nome muito curto.").optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  softDelete: z.boolean().optional().default(false),
  color: z.string().optional(),
  category: z.string().optional().default("Pipoca"),
});

export type CreateProductInputType = z.infer<typeof CreateProductInputSchema>;
export type UpdateProductInputType = z.infer<typeof UpdateProductInputSchema>;