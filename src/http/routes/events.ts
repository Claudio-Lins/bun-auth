import { db } from "@/database/client";
import { batches } from "@/database/schema/batches";
import { eventUnits } from "@/database/schema/event-units";
import { events } from "@/database/schema/events";
import { popcornUnits } from "@/database/schema/popcorn-units";
import { AllocateUnitsInputSchema, AllocateUnitsInputType, CreateEventInputSchema, CreateEventInputType, ReleaseUnitsInputSchema, ReleaseUnitsInputType, UpdateEventInputSchema, UpdateEventInputType } from "@/database/zod-schemas/event/event-input";
import { EventOutputSchema, EventOutputType } from "@/database/zod-schemas/event/event-output";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod/v4";

type EventParams = {
  params: {
    id: string
  }
}

/**
 * Seleciona unidades disponíveis para alocação em um evento
 * Respeita: batch, variant, validade e regras de disponibilidade
 */
async function selectAvailableUnits(params: {
  quantity: number;
  productVariantId?: string;
  batchId?: string;
  minExpirationDate?: Date;
}) {
  const { quantity, productVariantId, batchId, minExpirationDate } = params;

  // Construir condições base
  const conditions = [
    eq(popcornUnits.sold, false),
    eq(popcornUnits.isActive, true),
    eq(popcornUnits.isAvailable, true),
  ];

  // Filtrar por variant (através do batch)
  if (productVariantId) {
    conditions.push(eq(batches.productVariantId, productVariantId));
  }

  // Filtrar por batch específico
  if (batchId) {
    conditions.push(eq(popcornUnits.batchId, batchId));
  }

  // Filtrar por validade mínima
  if (minExpirationDate) {
    conditions.push(sql`${batches.expirationDate} >= ${minExpirationDate}`);
  }

  // Query principal: unidades disponíveis que NÃO estão alocadas
  // Usa LEFT JOIN para verificar se a unidade está alocada (sem released_at)
  const availableUnits = await db
    .select({
      unitId: popcornUnits.id,
      sku: popcornUnits.sku,
      batchId: popcornUnits.batchId,
      batchName: batches.name,
      variantId: batches.productVariantId,
      expirationDate: batches.expirationDate,
    })
    .from(popcornUnits)
    .innerJoin(batches, eq(popcornUnits.batchId, batches.id))
    .leftJoin(
      eventUnits,
      and(
        eq(eventUnits.popcornUnitId, popcornUnits.id),
        isNull(eventUnits.releasedAt)
      )
    )
    .where(
      and(
        ...conditions,
        isNull(eventUnits.id) // Unidade não está alocada (eventUnits.id é NULL no LEFT JOIN)
      )
    )
    .limit(quantity);

  return availableUnits;
}

/**
 * Aloca unidades para um evento, bloqueando-as automaticamente
 * Valida disponibilidade antes de alocar
 */
async function allocateUnitsToEvent(params: {
  eventId: string;
  quantity: number;
  productVariantId?: string;
  batchId?: string;
}) {
  const { eventId, quantity, productVariantId, batchId } = params;

  // 1. Selecionar unidades disponíveis
  const availableUnits = await selectAvailableUnits({
    quantity,
    productVariantId,
    batchId,
  });

  if (availableUnits.length < quantity) {
    throw new Error(
      `Não há unidades suficientes disponíveis. Encontradas: ${availableUnits.length}, Necessárias: ${quantity}`
    );
  }

  // 2. Criar registros de alocação (bloqueio automático)
  const allocations = availableUnits.map((unit) => ({
    eventId,
    popcornUnitId: unit.unitId,
  }));

  const inserted = await db
    .insert(eventUnits)
    .values(allocations)
    .returning();

  // 3. Atualizar is_available para false nas unidades alocadas
  const unitIds = availableUnits.map((u) => u.unitId);
  if (unitIds.length > 0) {
    await db
      .update(popcornUnits)
      .set({ isAvailable: false })
      .where(inArray(popcornUnits.id, unitIds));
  }

  return inserted;
}

/**
 * Libera unidades de um evento (marca released_at)
 */
async function releaseUnitsFromEvent(eventId: string, unitIds?: string[]) {
  const conditions = [eq(eventUnits.eventId, eventId), isNull(eventUnits.releasedAt)];

  if (unitIds && unitIds.length > 0) {
    conditions.push(inArray(eventUnits.popcornUnitId, unitIds));
  }

  const released = await db
    .update(eventUnits)
    .set({ releasedAt: sql`now()` })
    .where(and(...conditions))
    .returning();

  // Reativar is_available nas unidades liberadas
  const releasedUnitIds = released.map((r) => r.popcornUnitId);
  if (releasedUnitIds.length > 0) {
    await db
      .update(popcornUnits)
      .set({ isAvailable: true })
      .where(inArray(popcornUnits.id, releasedUnitIds));
  }

  return released;
}

function formatEventWithRelations(event: any): EventOutputType {
  // Calcular resumo de unidades alocadas
  const allocatedUnits = event.allocatedUnits || [];
  const totalAllocated = allocatedUnits.length;
  const currentlyAllocated = allocatedUnits.filter((u: any) => !u.releasedAt).length;
  const released = allocatedUnits.filter((u: any) => u.releasedAt).length;

  return {
    ...event,
    eventDate: event.eventDate instanceof Date ? event.eventDate.toISOString().split('T')[0] : event.eventDate,
    startTime: event.startTime instanceof Date ? event.startTime.toISOString() : event.startTime,
    endTime: event.endTime instanceof Date ? event.endTime.toISOString() : event.endTime,
    createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() : event.createdAt,
    updatedAt: event.updatedAt instanceof Date ? event.updatedAt.toISOString() : event.updatedAt,
    deletedAt: event.deletedAt instanceof Date ? event.deletedAt.toISOString() : event.deletedAt,
    unitsSummary: {
      totalAllocated,
      currentlyAllocated,
      released,
    },
  } as EventOutputType;
}

export const eventsRoutes = new Elysia()
  .get("/events", async function () {
    const allEvents = await db.query.events.findMany({
      where: sql`${events.deletedAt} IS NULL`,
      with: {
        allocatedUnits: true,
      },
      orderBy: (events, { desc }) => [desc(events.eventDate)],
    });

    return allEvents.map(formatEventWithRelations);
  }, {
    detail: {
      summary: "List all events",
      tags: ["Events"],
    },
  })
  .get("/events/:id", async function ({ params }: EventParams): Promise<EventOutputType> {
    const eventId = params.id;

    const event = await db.query.events.findFirst({
      where: and(
        eq(events.id, eventId),
        sql`${events.deletedAt} IS NULL`
      ),
      with: {
        allocatedUnits: {
          with: {
            popcornUnit: {
              with: {
                batch: {
                  with: {
                    variant: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    return formatEventWithRelations(event);
  }, {
    detail: {
      summary: "Get an event by ID",
      tags: ["Events"],
    },
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: EventOutputSchema,
    },
  })
  .post("/events", async function ({ body }: { body: CreateEventInputType }): Promise<EventOutputType> {
    // Processar datas: aceita startAt/endAt OU eventDate/startTime/endTime
    let eventDate: Date;
    let startTime: Date | null = null;
    let endTime: Date | null = null;

    if (body.startAt) {
      // Se startAt foi fornecido, usar ele para eventDate e startTime
      const startAtDate = new Date(body.startAt);
      eventDate = startAtDate;
      startTime = startAtDate;
      
      if (body.endAt) {
        endTime = new Date(body.endAt);
      }
    } else if (body.eventDate) {
      // Formato antigo: eventDate separado
      eventDate = new Date(body.eventDate);
      startTime = body.startTime ? new Date(body.startTime) : null;
      endTime = body.endTime ? new Date(body.endTime) : null;
    } else {
      throw new Error("Deve fornecer eventDate ou startAt");
    }

    // Converter strings de data para Date
    const eventData = {
      name: body.name,
      description: body.description || null,
      eventDate: eventDate,
      startTime: startTime,
      endTime: endTime,
      imageUrl: body.imageUrl || null,
      status: body.status || "PLANNED",
      internalOwnerId: body.internalOwnerId,
      allocatedUnits: body.allocatedUnits,
      maxSalesCapacity: body.maxSalesCapacity || null,
      eventPrice: body.eventPrice || "0",
      transportCost: body.transportCost || null,
      foodCost: body.foodCost || null,
      addressStreet: body.addressStreet || null,
      addressNumber: body.addressNumber || null,
      addressCity: body.addressCity || null,
      addressState: body.addressState || null,
      addressPostalCode: body.addressPostalCode || null,
      addressCountry: body.addressCountry || "PT",
    };

    const [event] = await db.insert(events).values(eventData).returning();

    if (!event) {
      throw new Error("Failed to create event");
    }

    // Alocar unidades automaticamente se especificado
    if (body.allocatedUnits > 0) {
      try {
        await allocateUnitsToEvent({
          eventId: event.id,
          quantity: body.allocatedUnits,
        });
      } catch (error) {
        // Se falhar na alocação, deletar o evento criado
        await db.delete(events).where(eq(events.id, event.id));
        throw error;
      }
    }

    // Buscar evento com unidades alocadas
    const eventWithUnits = await db.query.events.findFirst({
      where: eq(events.id, event.id),
      with: {
        allocatedUnits: true,
      },
    });

    return formatEventWithRelations(eventWithUnits || event);
  }, {
    requireRole: "MANAGER",
    detail: {
      summary: "Create an event",
      tags: ["Events"],
    },
    body: CreateEventInputSchema,
    response: {
      201: EventOutputSchema,
    },
  })
  .put("/events/:id", async function ({ params, body }: { params: { id: string }, body: UpdateEventInputType }): Promise<EventOutputType> {
    const eventId = params.id;

    const existingEvent = await db.query.events.findFirst({
      where: and(
        eq(events.id, eventId),
        sql`${events.deletedAt} IS NULL`
      ),
    });

    if (!existingEvent) {
      throw new Error("Event not found");
    }

    // Preparar dados de atualização
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.eventDate !== undefined) updateData.eventDate = new Date(body.eventDate);
    if (body.startTime !== undefined) updateData.startTime = body.startTime ? new Date(body.startTime) : null;
    if (body.endTime !== undefined) updateData.endTime = body.endTime ? new Date(body.endTime) : null;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.internalOwnerId !== undefined) updateData.internalOwnerId = body.internalOwnerId;
    if (body.maxSalesCapacity !== undefined) updateData.maxSalesCapacity = body.maxSalesCapacity || null;
    if (body.eventPrice !== undefined) updateData.eventPrice = body.eventPrice || null;
    if (body.transportCost !== undefined) updateData.transportCost = body.transportCost || null;
    if (body.foodCost !== undefined) updateData.foodCost = body.foodCost || null;
    if (body.addressStreet !== undefined) updateData.addressStreet = body.addressStreet || null;
    if (body.addressNumber !== undefined) updateData.addressNumber = body.addressNumber || null;
    if (body.addressCity !== undefined) updateData.addressCity = body.addressCity || null;
    if (body.addressState !== undefined) updateData.addressState = body.addressState || null;
    if (body.addressPostalCode !== undefined) updateData.addressPostalCode = body.addressPostalCode || null;
    if (body.addressCountry !== undefined) updateData.addressCountry = body.addressCountry || null;
    if (body.rating !== undefined) updateData.rating = body.rating || null;
    if (body.ratingComment !== undefined) updateData.ratingComment = body.ratingComment || null;

    const [updatedEvent] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, eventId))
      .returning();

    if (!updatedEvent) {
      throw new Error("Failed to update event");
    }

    // Buscar evento com unidades alocadas
    const eventWithUnits = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: {
        allocatedUnits: true,
      },
    });

    return formatEventWithRelations(eventWithUnits || updatedEvent);
  }, {
    requireRole: "MANAGER",
    detail: {
      summary: "Update an event",
      tags: ["Events"],
    },
    params: z.object({
      id: z.string(),
    }),
    body: UpdateEventInputSchema,
    response: {
      200: EventOutputSchema,
    },
  })
  .post("/events/:id/allocate-units", async function ({ params, body }: { params: { id: string }, body: AllocateUnitsInputType }): Promise<{ success: boolean; message: string; allocatedCount: number }> {
    const eventId = params.id;

    const event = await db.query.events.findFirst({
      where: and(
        eq(events.id, eventId),
        sql`${events.deletedAt} IS NULL`
      ),
    });

    if (!event) {
      throw new Error("Event not found");
    }

    const allocated = await allocateUnitsToEvent({
      eventId,
      quantity: body.quantity,
      productVariantId: body.productVariantId,
      batchId: body.batchId,
    });

    return {
      success: true,
      message: `${allocated.length} unidade(s) alocada(s) com sucesso para o evento`,
      allocatedCount: allocated.length,
    };
  }, {
    requireRole: "MANAGER",
    detail: {
      summary: "Allocate units to an event",
      tags: ["Events"],
    },
    params: z.object({
      id: z.string(),
    }),
    body: AllocateUnitsInputSchema,
    response: {
      200: z.object({
        success: z.boolean(),
        message: z.string(),
        allocatedCount: z.number(),
      }),
    },
  })
  .post("/events/:id/release-units", async function ({ params, body }: { params: { id: string }, body: ReleaseUnitsInputType }): Promise<{ success: boolean; message: string; releasedCount: number }> {
    const eventId = params.id;

    const event = await db.query.events.findFirst({
      where: and(
        eq(events.id, eventId),
        sql`${events.deletedAt} IS NULL`
      ),
    });

    if (!event) {
      throw new Error("Event not found");
    }

    const released = await releaseUnitsFromEvent(eventId, body.unitIds);

    return {
      success: true,
      message: `${released.length} unidade(s) liberada(s) com sucesso do evento`,
      releasedCount: released.length,
    };
  }, {
    requireRole: "MANAGER",
    detail: {
      summary: "Release units from an event",
      tags: ["Events"],
    },
    params: z.object({
      id: z.string(),
    }),
    body: ReleaseUnitsInputSchema,
    response: {
      200: z.object({
        success: z.boolean(),
        message: z.string(),
        releasedCount: z.number(),
      }),
    },
  })
  .delete("/events/:id", async function ({ params }: EventParams): Promise<{ success: boolean; message: string }> {
    const eventId = params.id;

    const event = await db.query.events.findFirst({
      where: and(
        eq(events.id, eventId),
        sql`${events.deletedAt} IS NULL`
      ),
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // Soft delete
    await db
      .update(events)
      .set({ deletedAt: sql`now()` })
      .where(eq(events.id, eventId));

    return {
      success: true,
      message: "Event deleted successfully",
    };
  }, {
    requireRole: "MANAGER",
    detail: {
      summary: "Delete an event (soft delete)",
      tags: ["Events"],
    },
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: z.object({
        success: z.boolean(),
        message: z.string(),
      }),
    },
  });

