// src/database/zod-schemas/event/event-output.ts
import { z } from "zod";

/**
 * EVENT OUTPUT
 * Schema de saída para eventos
 */
export const EventOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  eventDate: z.string(), // ISO string date
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  imageUrl: z.string().nullable(),
  status: z.string(),
  internalOwnerId: z.string(),
  allocatedUnits: z.number(),
  maxSalesCapacity: z.number().nullable(),
  eventPrice: z.string().nullable(), // numeric retorna string
  transportCost: z.string().nullable(),
  foodCost: z.string().nullable(),
  rating: z.number().nullable(),
  ratingComment: z.string().nullable(),
  addressStreet: z.string().nullable(),
  addressNumber: z.string().nullable(),
  addressCity: z.string().nullable(),
  addressState: z.string().nullable(),
  addressPostalCode: z.string().nullable(),
  addressCountry: z.string().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  
  // Informações calculadas sobre unidades alocadas
  unitsSummary: z.object({
    totalAllocated: z.number(),
    currentlyAllocated: z.number(), // unidades com released_at = NULL
    released: z.number(), // unidades com released_at != NULL
  }).optional(),
});

export type EventOutputType = z.infer<typeof EventOutputSchema>;

