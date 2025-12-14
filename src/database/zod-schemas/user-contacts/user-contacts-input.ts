// src/database/zod-schemas/user-contacts/user-contacts-input.ts
import { z } from "zod";
import { phonePtSchema } from "../shared/phone-pt";

/**
 * CREATE USER CONTACT INPUT
 * Valida dados de criação de contato de usuário
 */
export const CreateUserContactInputSchema = z.object({
  userId: z.string(),
   countryCode: z.literal("PT"),
  phone: phonePtSchema,
  isPrimary: z.boolean().optional().default(false),
  verified: z.boolean().optional().default(false),
});

/**
 * UPDATE USER CONTACT INPUT
 * Valida dados de atualização de contato de usuário
 */
export const UpdateUserContactInputSchema = z.object({
  phone: phonePtSchema.optional(),
  countryCode: z.literal("PT").optional(),
  isPrimary: z.boolean().optional(),
  verified: z.boolean().optional(),
});

export type CreateUserContactInputType = z.infer<typeof CreateUserContactInputSchema>;
export type UpdateUserContactInputType = z.infer<typeof UpdateUserContactInputSchema>;

