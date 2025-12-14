// src/database/zod-schemas/user-addresses/user-addresses-output.ts
import { z } from "zod";

/**
 * USER ADDRESS OUTPUT
 * Saída detalhada de endereço de usuário
 */
export const UserAddressOutputSchema = z.object({
  id: z.string(),
  userId: z.string(),
  street: z.string(),
  number: z.string().nullable(),
  complement: z.string().nullable(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string().nullable(),
  postalCode: z.string(),
  country: z.string().default("PT"),
  isPrimary: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserAddressOutputType = z.infer<typeof UserAddressOutputSchema>;

