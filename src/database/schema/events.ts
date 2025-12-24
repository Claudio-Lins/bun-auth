import { relations, sql } from "drizzle-orm";
import { integer, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { eventUnits } from "./event-units";

/**
 * EVENTS
 * Representa feiras/eventos onde a Popjoy participa
 */
export const events = pgTable("events", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  // =========================
  // INFORMAÇÕES BÁSICAS
  // =========================
  name: text("name").notNull(), // ▲ MUDANÇA: eventName → name (padrão simples)
  description: text("description"),

  eventDate: timestamp("event_date", { mode: "date" }).notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),

  imageUrl: text("image_url"),

  // =========================
  // STATUS & RESPONSABILIDADE
  // =========================
  status: text("status").notNull(), 
  // ▲ MUDANÇA: status crítico (ex: PLANNED | CONFIRMED | CANCELLED | FINISHED)

  internalOwnerId: text("internal_owner_id").notNull(),
  // ▲ MUDANÇA: responsável interno (FK futura para users)

  // =========================
  // CAPACIDADE & UNIDADES
  // =========================
  allocatedUnits: integer("allocated_units").default(0).notNull(),
  // ▲ Unidades físicas alocadas (será atualizado conforme unidades são alocadas via /events/:id/allocate-units)

  maxSalesCapacity: integer("max_sales_capacity"),
  // ▲ MUDANÇA: controle de limite de vendas no evento

  // =========================
  // FINANCEIRO
  // =========================
  eventPrice: numeric("event_price", { precision: 10, scale: 2 }).default("0"),
  // ▲ MUDANÇA: custo para participar do evento

  transportCost: numeric("transport_cost", { precision: 10, scale: 2 }),
  foodCost: numeric("food_cost", { precision: 10, scale: 2 }),

  // =========================
  // AVALIAÇÃO PÓS-EVENTO
  // =========================
  rating: integer("rating"),
  ratingComment: text("rating_comment"),

  // =========================
  // ENDEREÇO (ESTRUTURADO)
  // =========================
  addressStreet: text("address_street"),
  addressNumber: text("address_number"),
  addressCity: text("address_city"),
  addressState: text("address_state"),
  addressPostalCode: text("address_postal_code"),
  addressCountry: text("address_country"),

  // =========================
  // AUDITORIA & SOFT DELETE
  // =========================
  deletedAt: timestamp("deleted_at"),
  // ▲ MUDANÇA: soft delete profissional (TIMESTAMP NULL)

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Relacionamentos
export const eventsRelations = relations(events, ({ many }) => ({
  allocatedUnits: many(eventUnits), // event → muitas event_units
}));