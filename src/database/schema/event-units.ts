import { relations, sql } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { events } from "./events";
import { popcornUnits } from "./popcorn-units";

/**
 * EVENT_UNITS
 * Tabela intermediária que relaciona eventos com unidades de pipoca alocadas
 * Controla o ciclo de vida da alocação (allocated_at → released_at)
 */
export const eventUnits = pgTable("event_units", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),

  popcornUnitId: text("popcorn_unit_id")
    .notNull()
    .references(() => popcornUnits.id, { onDelete: "cascade" }),

  // =========================
  // CONTROLE DE ALOCAÇÃO
  // =========================
  allocatedAt: timestamp("allocated_at")
    .defaultNow()
    .notNull(), // Quando foi alocada para o evento

  releasedAt: timestamp("released_at"), // Quando foi liberada (NULL = ainda alocada)

  // =========================
  // AUDITORIA
  // =========================
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => ({
  // Garante que uma unidade não pode estar alocada em múltiplos eventos simultaneamente
  // (sem released_at)
  eventUnitsUnitIdx: index("event_units_popcorn_unit_id_idx").on(table.popcornUnitId),
  
  // Acelera consultas de unidades de um evento específico
  eventUnitsEventIdx: index("event_units_event_id_idx").on(table.eventId),
  
  // Acelera consultas de unidades ainda alocadas (released_at IS NULL)
  eventUnitsReleasedIdx: index("event_units_released_at_idx").on(table.releasedAt),
  
  // Índice composto para verificar se unidade está disponível
  eventUnitsAvailabilityIdx: index("event_units_availability_idx")
    .on(table.popcornUnitId, table.releasedAt),
}));

// Relacionamentos
export const eventUnitsRelations = relations(eventUnits, ({ one }) => ({
  event: one(events, {
    fields: [eventUnits.eventId],
    references: [events.id],
  }),
  
  popcornUnit: one(popcornUnits, {
    fields: [eventUnits.popcornUnitId],
    references: [popcornUnits.id],
  }),
}));

