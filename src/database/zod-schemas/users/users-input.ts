// src/database/zod-schemas/users/users-input.ts
import { z } from "zod";

/**
 * CREATE USER INPUT
 * Valida dados de criação de usuário
 */
export const CreateUserInputSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  email: z.string().email("Email inválido."),
  image: z.string().url("URL de imagem inválida.").optional(),
  role: z.enum(["user", "admin"]).optional().default("user"),
});

/**
 * UPDATE USER INPUT
 * Valida dados de atualização de usuário
 */
export const UpdateUserInputSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório.").optional(),
  email: z.string().email("Email inválido.").optional(),
  image: z.string().url("URL de imagem inválida.").optional(),
  role: z.enum(["user", "admin"]).optional(),
  emailVerified: z.boolean().optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional(),
  banExpires: z.string().datetime().optional(),
});

export type CreateUserInputType = z.infer<typeof CreateUserInputSchema>;
export type UpdateUserInputType = z.infer<typeof UpdateUserInputSchema>;