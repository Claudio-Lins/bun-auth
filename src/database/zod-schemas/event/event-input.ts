// src/database/zod-schemas/event/event-input.ts
import { z } from "zod";

/**
 * CREATE EVENT INPUT
 * Valida dados de criação de evento
 * Aceita tanto eventDate/startTime/endTime quanto startAt/endAt
 */
export const CreateEventInputSchema = z.object({
  name: z.string().min(2, "Nome muito curto."),
  description: z.string().optional(),
  // Formato antigo: eventDate + startTime/endTime
  eventDate: z.string().optional(), // ISO string date
  startTime: z.string().optional(), // ISO string timestamp
  endTime: z.string().optional(), // ISO string timestamp
  // Formato novo: startAt/endAt (preferido)
  startAt: z.string().optional(), // ISO string timestamp
  endAt: z.string().optional(), // ISO string timestamp
  imageUrl: z.string().optional(), // Aceita qualquer string ou vazio
  status: z.enum(["PLANNED", "CONFIRMED", "CANCELLED", "FINISHED"]).default("PLANNED"),
  internalOwnerId: z.string(),
  allocatedUnits: z.number().int().positive("Deve alocar pelo menos 1 unidade"),
  maxSalesCapacity: z.number().int().positive().optional(),
  eventPrice: z.string().optional(), // numeric como string
  transportCost: z.string().optional(), // numeric como string
  foodCost: z.string().optional(), // numeric como string
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressPostalCode: z.string().optional(),
  addressCountry: z.string().optional().default("PT"),
}).refine((data) => {
  // Deve ter eventDate OU startAt
  return !!(data.eventDate || data.startAt);
}, {
  message: "Deve fornecer eventDate ou startAt",
  path: ["startAt"],
});

/**
 * UPDATE EVENT INPUT
 * Valida dados de atualização de evento
 */
export const UpdateEventInputSchema = z.object({
  name: z.string().min(2, "Nome muito curto.").optional(),
  description: z.string().optional(),
  eventDate: z.string().optional(), // ISO string date
  startTime: z.string().optional(), // ISO string timestamp
  endTime: z.string().optional(), // ISO string timestamp
  imageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["PLANNED", "CONFIRMED", "CANCELLED", "FINISHED"]).optional(),
  internalOwnerId: z.string().optional(),
  allocatedUnits: z.number().int().positive().optional(),
  maxSalesCapacity: z.number().int().positive().optional(),
  eventPrice: z.string().optional(), // numeric como string
  transportCost: z.string().optional(), // numeric como string
  foodCost: z.string().optional(), // numeric como string
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressPostalCode: z.string().optional(),
  addressCountry: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  ratingComment: z.string().optional(),
});

/**
 * ALLOCATE UNITS INPUT
 * Valida dados para alocar unidades em um evento
 */
export const AllocateUnitsInputSchema = z.object({
  quantity: z.number().int().positive("Quantidade deve ser maior que zero"),
  productVariantId: z.string().optional(), // Filtrar por variante específica
  batchId: z.string().optional(), // Filtrar por lote específico
});

/**
 * RELEASE UNITS INPUT
 * Valida dados para liberar unidades de um evento
 */
export const ReleaseUnitsInputSchema = z.object({
  unitIds: z.array(z.string()).optional(), // Se não fornecido, libera todas as unidades do evento
});

export type CreateEventInputType = z.infer<typeof CreateEventInputSchema>;
export type UpdateEventInputType = z.infer<typeof UpdateEventInputSchema>;
export type AllocateUnitsInputType = z.infer<typeof AllocateUnitsInputSchema>;
export type ReleaseUnitsInputType = z.infer<typeof ReleaseUnitsInputSchema>;

