import { z } from "zod";

/**
 * Comentário: Representa valor monetário decimal com 2 casas
 * Ex: "12.90", "0.50", "1000.00"
 */
export const moneySchema = z
  .string()
  .regex(/^\d+(\.\d{2})$/, "Valor monetário inválido");