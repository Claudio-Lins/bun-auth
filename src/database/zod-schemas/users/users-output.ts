// src/database/zod-schemas/users/users-output.ts
import { z } from "zod";
import { UserAddressOutputSchema } from "../user-addresses/user-addresses-output";
import { UserContactOutputSchema } from "../user-contacts/user-contacts-output";

/**
 * USER OUTPUT
 * Saída detalhada de usuário
 */
export const UserOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean().default(false),
  image: z.string().nullable(),
  role: z.string().default("user"),
  banned: z.boolean().nullable(),
  banReason: z.string().nullable(),
  banExpires: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  contacts: z.array(UserContactOutputSchema).optional(),
  addresses: z.array(UserAddressOutputSchema).optional(),
});

export type UserOutputType = z.infer<typeof UserOutputSchema>;

