// src/database/zod-schemas/user-addresses/user-addresses-input.ts
import { z } from "zod";
import { postalCodeSchema } from "../shared/postal-code";

/**
 * CREATE USER ADDRESS INPUT
 * Valida dados de criação de endereço de usuário
 */
export const CreateUserAddressInputSchema = z.object({
  userId: z.string(),
  street: z.string().min(1, "Rua é obrigatória."),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório."),
  city: z.string().min(1, "Cidade é obrigatória."),
  state: z.string().optional(),
  postalCode: postalCodeSchema,
  country: z.string().optional().default("PT"),
  isPrimary: z.boolean().optional().default(true),
});

/**
 * UPDATE USER ADDRESS INPUT
 * Valida dados de atualização de endereço de usuário
 */
export const UpdateUserAddressInputSchema = z.object({
  street: z.string().min(1, "Rua é obrigatória.").optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório.").optional(),
  city: z.string().min(1, "Cidade é obrigatória.").optional(),
  state: z.string().optional(),
  postalCode: postalCodeSchema.optional(),
  country: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export type CreateUserAddressInputType = z.infer<typeof CreateUserAddressInputSchema>;
export type UpdateUserAddressInputType = z.infer<typeof UpdateUserAddressInputSchema>;

