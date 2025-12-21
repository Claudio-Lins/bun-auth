# 📋 Guia de Implementação Frontend - Events

Este documento fornece instruções completas para implementar todas as funcionalidades de Events no frontend, incluindo tipos TypeScript, funções de API, formulários e componentes.

## 📦 Dependências Necessárias

```bash
npm install react-hook-form @hookform/resolvers zod
# ou
yarn add react-hook-form @hookform/resolvers zod
```

## 🔷 1. Tipos TypeScript

Crie o arquivo `src/types/events.ts`:

```typescript
// src/types/events.ts

/**
 * Status do evento
 */
export type EventStatus = "PLANNED" | "CONFIRMED" | "CANCELLED" | "FINISHED";

/**
 * Schema de entrada para criar evento
 */
export interface CreateEventInput {
  name: string;
  description?: string;
  eventDate?: string; // ISO string date (YYYY-MM-DD)
  startTime?: string; // ISO string timestamp
  endTime?: string; // ISO string timestamp
  imageUrl?: string;
  status?: EventStatus;
  internalOwnerId: string;
  allocatedUnits?: number; // Opcional, padrão 0
  maxSalesCapacity?: number;
  eventPrice?: string; // numeric como string
  transportCost?: string;
  foodCost?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string; // Padrão "PT"
}

/**
 * Schema de entrada para atualizar evento
 */
export interface UpdateEventInput {
  name?: string;
  description?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  imageUrl?: string;
  status?: EventStatus;
  internalOwnerId?: string;
  allocatedUnits?: number;
  maxSalesCapacity?: number;
  eventPrice?: string;
  transportCost?: string;
  foodCost?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  rating?: number; // 1-5
  ratingComment?: string;
}

/**
 * Schema de entrada para alocar unidades
 */
export interface AllocateUnitsInput {
  quantity: number;
  productVariantId?: string;
  batchId?: string;
}

/**
 * Schema de entrada para liberar unidades
 */
export interface ReleaseUnitsInput {
  unitIds?: string[]; // Se não fornecido, libera todas
}

/**
 * Unidade alocada com detalhes completos
 */
export interface AllocatedUnit {
  id: string;
  eventId: string;
  popcornUnitId: string;
  allocatedAt: string;
  releasedAt: string | null;
  createdAt: string;
  updatedAt: string;
  popcornUnit?: {
    id: string;
    batchId: string;
    sku: string;
    batch?: {
      id: string;
      name: string;
      variant?: {
        id: string;
        weight: number;
        retailPrice: string;
        partnerPrice: string;
      };
    };
  };
}

/**
 * Resumo de unidades alocadas
 */
export interface UnitsSummary {
  totalAllocated: number;
  currentlyAllocated: number; // unidades com released_at = NULL
  released: number; // unidades com released_at != NULL
}

/**
 * Schema de saída do evento
 */
export interface EventOutput {
  id: string;
  name: string;
  description: string | null;
  eventDate: string; // ISO string date (YYYY-MM-DD)
  startTime: string | null; // ISO string timestamp
  endTime: string | null; // ISO string timestamp
  imageUrl: string | null;
  status: string;
  internalOwnerId: string;
  allocatedUnits: number; // Número total de unidades alocadas
  maxSalesCapacity: number | null;
  eventPrice: string | null;
  transportCost: string | null;
  foodCost: string | null;
  rating: number | null;
  ratingComment: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressPostalCode: string | null;
  addressCountry: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  unitsSummary?: UnitsSummary;
}

/**
 * Resposta de alocação de unidades
 */
export interface AllocateUnitsResponse {
  success: boolean;
  message: string;
  allocatedCount: number;
}

/**
 * Resposta de liberação de unidades
 */
export interface ReleaseUnitsResponse {
  success: boolean;
  message: string;
  releasedCount: number;
}

/**
 * Resposta de exclusão de evento
 */
export interface DeleteEventResponse {
  success: boolean;
  message: string;
}
```

## 🔷 2. Schemas Zod para Validação

Crie o arquivo `src/schemas/event-schemas.ts`:

```typescript
// src/schemas/event-schemas.ts
import { z } from "zod";

/**
 * Schema Zod para criar evento
 */
export const createEventSchema = z.object({
  name: z.string().min(2, "Nome muito curto."),
  description: z.string().optional(),
  eventDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(["PLANNED", "CONFIRMED", "CANCELLED", "FINISHED"]).default("PLANNED"),
  internalOwnerId: z.string().min(1, "Responsável é obrigatório"),
  allocatedUnits: z.number().int().min(0).optional().default(0),
  maxSalesCapacity: z.number().int().positive().optional(),
  eventPrice: z.string().optional(),
  transportCost: z.string().optional(),
  foodCost: z.string().optional(),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressPostalCode: z.string().optional(),
  addressCountry: z.string().optional().default("PT"),
}).refine((data) => {
  return !!(data.eventDate || data.startTime || data.endTime);
}, {
  message: "Deve fornecer eventDate ou startTime e endTime",
  path: ["startTime"],
});

/**
 * Schema Zod para atualizar evento
 */
export const updateEventSchema = z.object({
  name: z.string().min(2, "Nome muito curto.").optional(),
  description: z.string().optional(),
  eventDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  status: z.enum(["PLANNED", "CONFIRMED", "CANCELLED", "FINISHED"]).optional(),
  internalOwnerId: z.string().optional(),
  allocatedUnits: z.number().int().positive().optional(),
  maxSalesCapacity: z.number().int().positive().optional(),
  eventPrice: z.string().optional(),
  transportCost: z.string().optional(),
  foodCost: z.string().optional(),
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
 * Schema Zod para alocar unidades
 */
export const allocateUnitsSchema = z.object({
  quantity: z.number().int().positive("Quantidade deve ser maior que zero"),
  productVariantId: z.string().optional(),
  batchId: z.string().optional(),
});

/**
 * Schema Zod para liberar unidades
 */
export const releaseUnitsSchema = z.object({
  unitIds: z.array(z.string()).optional(),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
export type AllocateUnitsFormData = z.infer<typeof allocateUnitsSchema>;
export type ReleaseUnitsFormData = z.infer<typeof releaseUnitsSchema>;
```

## 🔷 3. Funções de API (Actions/Hooks)

Crie o arquivo `src/lib/api/events.ts`:

```typescript
// src/lib/api/events.ts
import type {
  EventOutput,
  CreateEventInput,
  UpdateEventInput,
  AllocateUnitsInput,
  ReleaseUnitsInput,
  AllocateUnitsResponse,
  ReleaseUnitsResponse,
  DeleteEventResponse,
} from "@/types/events";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

/**
 * Função auxiliar para fazer requisições autenticadas
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Importante para enviar cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro desconhecido" }));
    throw new Error(error.message || `Erro ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Listar todos os eventos
 */
export async function getEvents(): Promise<EventOutput[]> {
  return apiFetch<EventOutput[]>("/events");
}

/**
 * Buscar evento por ID
 */
export async function getEventById(id: string): Promise<EventOutput> {
  return apiFetch<EventOutput>(`/events/${id}`);
}

/**
 * Criar novo evento
 */
export async function createEvent(data: CreateEventInput): Promise<EventOutput> {
  return apiFetch<EventOutput>("/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Atualizar evento existente
 */
export async function updateEvent(
  id: string,
  data: UpdateEventInput
): Promise<EventOutput> {
  return apiFetch<EventOutput>(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Deletar evento (soft delete)
 */
export async function deleteEvent(id: string): Promise<DeleteEventResponse> {
  return apiFetch<DeleteEventResponse>(`/events/${id}`, {
    method: "DELETE",
  });
}

/**
 * Alocar unidades para um evento
 */
export async function allocateUnitsToEvent(
  eventId: string,
  data: AllocateUnitsInput
): Promise<AllocateUnitsResponse> {
  return apiFetch<AllocateUnitsResponse>(`/events/${eventId}/allocate-units`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Liberar unidades de um evento
 */
export async function releaseUnitsFromEvent(
  eventId: string,
  data: ReleaseUnitsInput
): Promise<ReleaseUnitsResponse> {
  return apiFetch<ReleaseUnitsResponse>(`/events/${eventId}/release-units`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
```

## 🔷 4. Componente: Formulário de Criação de Evento

Crie o arquivo `src/components/events/CreateEventForm.tsx`:

```typescript
// src/components/events/CreateEventForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema, type CreateEventFormData } from "@/schemas/event-schemas";
import { createEvent } from "@/lib/api/events";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateEventFormProps {
  internalOwnerId: string; // ID do usuário responsável
  onSuccess?: (event: EventOutput) => void;
  onCancel?: () => void;
}

export function CreateEventForm({ internalOwnerId, onSuccess, onCancel }: CreateEventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      status: "PLANNED",
      allocatedUnits: 0,
      addressCountry: "PT",
      internalOwnerId,
    },
  });

  const useDateTimeInputs = watch("startTime") || watch("endTime");

  async function onSubmit(data: CreateEventFormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const event = await createEvent(data);
      onSuccess?.(event);
      router.push(`/events/${event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar evento");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Nome */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Nome do Evento *
        </label>
        <input
          id="name"
          {...register("name")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Descrição
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      {/* Opção: Usar data/hora separadas OU data única */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Formato de Data/Hora
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="date"
                checked={!useDateTimeInputs}
                onChange={() => {
                  // Reset startTime e endTime quando selecionar date
                }}
                className="mr-2"
              />
              Data única (eventDate)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="datetime"
                checked={!!useDateTimeInputs}
                onChange={() => {
                  // Habilitar startTime e endTime
                }}
                className="mr-2"
              />
              Data e Hora (startTime/endTime)
            </label>
          </div>
        </div>

        {!useDateTimeInputs ? (
          /* Data única */
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium">
              Data do Evento *
            </label>
            <input
              id="eventDate"
              type="date"
              {...register("eventDate")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.eventDate && (
              <p className="mt-1 text-sm text-red-600">{errors.eventDate.message}</p>
            )}
          </div>
        ) : (
          /* Data e Hora */
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium">
                Início *
              </label>
              <input
                id="startTime"
                type="datetime-local"
                {...register("startTime")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium">
                Fim
              </label>
              <input
                id="endTime"
                type="datetime-local"
                {...register("endTime")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          {...register("status")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="PLANNED">Planejado</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="CANCELLED">Cancelado</option>
          <option value="FINISHED">Finalizado</option>
        </select>
      </div>

      {/* URL da Imagem */}
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium">
          URL da Imagem
        </label>
        <input
          id="imageUrl"
          type="url"
          {...register("imageUrl")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.imageUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* Capacidade Máxima de Vendas */}
      <div>
        <label htmlFor="maxSalesCapacity" className="block text-sm font-medium">
          Capacidade Máxima de Vendas
        </label>
        <input
          id="maxSalesCapacity"
          type="number"
          min="1"
          {...register("maxSalesCapacity", { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.maxSalesCapacity && (
          <p className="mt-1 text-sm text-red-600">{errors.maxSalesCapacity.message}</p>
        )}
      </div>

      {/* Informações Financeiras */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="eventPrice" className="block text-sm font-medium">
            Preço do Evento
          </label>
          <input
            id="eventPrice"
            type="text"
            placeholder="0.00"
            {...register("eventPrice")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="transportCost" className="block text-sm font-medium">
            Custo de Transporte
          </label>
          <input
            id="transportCost"
            type="text"
            placeholder="0.00"
            {...register("transportCost")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="foodCost" className="block text-sm font-medium">
            Custo de Alimentação
          </label>
          <input
            id="foodCost"
            type="text"
            placeholder="0.00"
            {...register("foodCost")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Endereço</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="addressStreet" className="block text-sm font-medium">
              Rua
            </label>
            <input
              id="addressStreet"
              {...register("addressStreet")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="addressNumber" className="block text-sm font-medium">
              Número
            </label>
            <input
              id="addressNumber"
              {...register("addressNumber")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="addressCity" className="block text-sm font-medium">
              Cidade
            </label>
            <input
              id="addressCity"
              {...register("addressCity")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="addressState" className="block text-sm font-medium">
              Estado
            </label>
            <input
              id="addressState"
              {...register("addressState")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="addressPostalCode" className="block text-sm font-medium">
              Código Postal
            </label>
            <input
              id="addressPostalCode"
              {...register("addressPostalCode")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="addressCountry" className="block text-sm font-medium">
            País
          </label>
          <input
            id="addressCountry"
            {...register("addressCountry")}
            defaultValue="PT"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          {isSubmitting ? "Criando..." : "Criar Evento"}
        </button>
      </div>
    </form>
  );
}
```

## 🔷 5. Componente: Formulário de Edição de Evento

Crie o arquivo `src/components/events/UpdateEventForm.tsx`:

```typescript
// src/components/events/UpdateEventForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEventSchema, type UpdateEventFormData } from "@/schemas/event-schemas";
import { updateEvent, type EventOutput } from "@/lib/api/events";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UpdateEventFormProps {
  event: EventOutput;
  onSuccess?: (event: EventOutput) => void;
  onCancel?: () => void;
}

export function UpdateEventForm({ event, onSuccess, onCancel }: UpdateEventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateEventFormData>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      name: event.name,
      description: event.description || undefined,
      eventDate: event.eventDate,
      startTime: event.startTime || undefined,
      endTime: event.endTime || undefined,
      imageUrl: event.imageUrl || undefined,
      status: event.status as any,
      internalOwnerId: event.internalOwnerId,
      maxSalesCapacity: event.maxSalesCapacity || undefined,
      eventPrice: event.eventPrice || undefined,
      transportCost: event.transportCost || undefined,
      foodCost: event.foodCost || undefined,
      addressStreet: event.addressStreet || undefined,
      addressNumber: event.addressNumber || undefined,
      addressCity: event.addressCity || undefined,
      addressState: event.addressState || undefined,
      addressPostalCode: event.addressPostalCode || undefined,
      addressCountry: event.addressCountry || undefined,
      rating: event.rating || undefined,
      ratingComment: event.ratingComment || undefined,
    },
  });

  useEffect(() => {
    reset({
      name: event.name,
      description: event.description || undefined,
      eventDate: event.eventDate,
      startTime: event.startTime || undefined,
      endTime: event.endTime || undefined,
      imageUrl: event.imageUrl || undefined,
      status: event.status as any,
      internalOwnerId: event.internalOwnerId,
      maxSalesCapacity: event.maxSalesCapacity || undefined,
      eventPrice: event.eventPrice || undefined,
      transportCost: event.transportCost || undefined,
      foodCost: event.foodCost || undefined,
      addressStreet: event.addressStreet || undefined,
      addressNumber: event.addressNumber || undefined,
      addressCity: event.addressCity || undefined,
      addressState: event.addressState || undefined,
      addressPostalCode: event.addressPostalCode || undefined,
      addressCountry: event.addressCountry || undefined,
      rating: event.rating || undefined,
      ratingComment: event.ratingComment || undefined,
    });
  }, [event, reset]);

  async function onSubmit(data: UpdateEventFormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedEvent = await updateEvent(event.id, data);
      onSuccess?.(updatedEvent);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar evento");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Campos similares ao CreateEventForm, mas todos opcionais */}
      {/* Adicionar campos de rating e ratingComment para eventos finalizados */}
      
      {event.status === "FINISHED" && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-medium">Avaliação Pós-Evento</h3>
          <div>
            <label htmlFor="rating" className="block text-sm font-medium">
              Avaliação (1-5)
            </label>
            <input
              id="rating"
              type="number"
              min="1"
              max="5"
              {...register("rating", { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="ratingComment" className="block text-sm font-medium">
              Comentário da Avaliação
            </label>
            <textarea
              id="ratingComment"
              {...register("ratingComment")}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          {isSubmitting ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </form>
  );
}
```

## 🔷 6. Componente: Lista de Eventos

Crie o arquivo `src/components/events/EventsList.tsx`:

```typescript
// src/components/events/EventsList.tsx
"use client";

import { useEffect, useState } from "react";
import { getEvents, type EventOutput } from "@/lib/api/events";
import Link from "next/link";

export function EventsList() {
  const [events, setEvents] = useState<EventOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar eventos");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  if (loading) return <div>Carregando eventos...</div>;
  if (error) return <div className="text-red-600">Erro: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Eventos</h2>
        <Link
          href="/events/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Novo Evento
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="block p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Data:</span>{" "}
                {new Date(event.eventDate).toLocaleDateString("pt-PT")}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    event.status === "PLANNED"
                      ? "bg-yellow-100 text-yellow-800"
                      : event.status === "CONFIRMED"
                      ? "bg-green-100 text-green-800"
                      : event.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {event.status}
                </span>
              </div>
              {event.unitsSummary && (
                <div>
                  <span className="font-medium">Unidades:</span>{" "}
                  {event.unitsSummary.currentlyAllocated} alocadas
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nenhum evento encontrado
        </div>
      )}
    </div>
  );
}
```

## 🔷 7. Componente: Detalhes do Evento

Crie o arquivo `src/components/events/EventDetails.tsx`:

```typescript
// src/components/events/EventDetails.tsx
"use client";

import { useEffect, useState } from "react";
import { getEventById, deleteEvent, type EventOutput } from "@/lib/api/events";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface EventDetailsProps {
  eventId: string;
}

export function EventDetails({ eventId }: EventDetailsProps) {
  const router = useRouter();
  const [event, setEvent] = useState<EventOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      try {
        const data = await getEventById(eventId);
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar evento");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;

    setIsDeleting(true);
    try {
      await deleteEvent(eventId);
      router.push("/events");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir evento");
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-600">Erro: {error}</div>;
  if (!event) return <div>Evento não encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{event.name}</h1>
          {event.description && (
            <p className="text-gray-600 mt-2">{event.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/events/${eventId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Editar
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>

      {/* Informações do Evento */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Informações Gerais</h2>
          <dl className="space-y-2">
            <div>
              <dt className="font-medium">Data:</dt>
              <dd>{new Date(event.eventDate).toLocaleDateString("pt-PT")}</dd>
            </div>
            {event.startTime && (
              <div>
                <dt className="font-medium">Início:</dt>
                <dd>{new Date(event.startTime).toLocaleString("pt-PT")}</dd>
              </div>
            )}
            {event.endTime && (
              <div>
                <dt className="font-medium">Fim:</dt>
                <dd>{new Date(event.endTime).toLocaleString("pt-PT")}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium">Status:</dt>
              <dd>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    event.status === "PLANNED"
                      ? "bg-yellow-100 text-yellow-800"
                      : event.status === "CONFIRMED"
                      ? "bg-green-100 text-green-800"
                      : event.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {event.status}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Unidades Alocadas</h2>
          {event.unitsSummary && (
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Total Alocadas:</dt>
                <dd>{event.unitsSummary.totalAllocated}</dd>
              </div>
              <div>
                <dt className="font-medium">Atualmente Alocadas:</dt>
                <dd>{event.unitsSummary.currentlyAllocated}</dd>
              </div>
              <div>
                <dt className="font-medium">Liberadas:</dt>
                <dd>{event.unitsSummary.released}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>

      {/* Endereço */}
      {(event.addressStreet || event.addressCity) && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Endereço</h2>
          <p>
            {event.addressStreet} {event.addressNumber}
            <br />
            {event.addressPostalCode} {event.addressCity}
            {event.addressState && `, ${event.addressState}`}
            {event.addressCountry && `, ${event.addressCountry}`}
          </p>
        </div>
      )}

      {/* Informações Financeiras */}
      {(event.eventPrice || event.transportCost || event.foodCost) && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Custos</h2>
          <dl className="space-y-2">
            {event.eventPrice && (
              <div>
                <dt className="font-medium">Preço do Evento:</dt>
                <dd>{parseFloat(event.eventPrice).toFixed(2)} €</dd>
              </div>
            )}
            {event.transportCost && (
              <div>
                <dt className="font-medium">Custo de Transporte:</dt>
                <dd>{parseFloat(event.transportCost).toFixed(2)} €</dd>
              </div>
            )}
            {event.foodCost && (
              <div>
                <dt className="font-medium">Custo de Alimentação:</dt>
                <dd>{parseFloat(event.foodCost).toFixed(2)} €</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Avaliação (se evento finalizado) */}
      {event.status === "FINISHED" && event.rating && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Avaliação</h2>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Nota:</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < event.rating! ? "text-yellow-400" : "text-gray-300"}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            {event.ratingComment && (
              <p className="mt-2 text-gray-600">{event.ratingComment}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

## 🔷 8. Componente: Alocar Unidades

Crie o arquivo `src/components/events/AllocateUnitsForm.tsx`:

```typescript
// src/components/events/AllocateUnitsForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { allocateUnitsSchema, type AllocateUnitsFormData } from "@/schemas/event-schemas";
import { allocateUnitsToEvent } from "@/lib/api/events";
import { useState } from "react";

interface AllocateUnitsFormProps {
  eventId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AllocateUnitsForm({ eventId, onSuccess, onCancel }: AllocateUnitsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AllocateUnitsFormData>({
    resolver: zodResolver(allocateUnitsSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  async function onSubmit(data: AllocateUnitsFormData) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await allocateUnitsToEvent(eventId, data);
      setSuccess(result.message);
      reset();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alocar unidades");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium">
          Quantidade *
        </label>
        <input
          id="quantity"
          type="number"
          min="1"
          {...register("quantity", { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.quantity && (
          <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="productVariantId" className="block text-sm font-medium">
          Variante do Produto (opcional)
        </label>
        <input
          id="productVariantId"
          {...register("productVariantId")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="ID da variante"
        />
        <p className="mt-1 text-xs text-gray-500">
          Deixe em branco para alocar de qualquer variante
        </p>
      </div>

      <div>
        <label htmlFor="batchId" className="block text-sm font-medium">
          Lote (opcional)
        </label>
        <input
          id="batchId"
          {...register("batchId")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="ID do lote"
        />
        <p className="mt-1 text-xs text-gray-500">
          Deixe em branco para alocar de qualquer lote
        </p>
      </div>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
        >
          {isSubmitting ? "Alocando..." : "Alocar Unidades"}
        </button>
      </div>
    </form>
  );
}
```

## 🔷 9. Componente: Liberar Unidades

Crie o arquivo `src/components/events/ReleaseUnitsForm.tsx`:

```typescript
// src/components/events/ReleaseUnitsForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { releaseUnitsSchema, type ReleaseUnitsFormData } from "@/schemas/event-schemas";
import { releaseUnitsFromEvent } from "@/lib/api/events";
import { useState } from "react";
import type { AllocatedUnit } from "@/types/events";

interface ReleaseUnitsFormProps {
  eventId: string;
  allocatedUnits: AllocatedUnit[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReleaseUnitsForm({
  eventId,
  allocatedUnits,
  onSuccess,
  onCancel,
}: ReleaseUnitsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ReleaseUnitsFormData>({
    resolver: zodResolver(releaseUnitsSchema),
    defaultValues: {
      unitIds: [],
    },
  });

  const selectedUnitIds = watch("unitIds") || [];
  const currentlyAllocated = allocatedUnits.filter((u) => !u.releasedAt);

  async function onSubmit(data: ReleaseUnitsFormData) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await releaseUnitsFromEvent(eventId, data);
      setSuccess(result.message);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao liberar unidades");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSelectAll() {
    // Implementar seleção de todas as unidades
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">
            Selecionar Unidades para Liberar
          </label>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm text-blue-600"
          >
            Selecionar Todas
          </button>
        </div>

        {currentlyAllocated.length === 0 ? (
          <p className="text-gray-500">Nenhuma unidade alocada para liberar</p>
        ) : (
          <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
            {currentlyAllocated.map((unit) => (
              <label
                key={unit.id}
                className="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  value={unit.id}
                  {...register("unitIds")}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium">SKU: {unit.popcornUnit?.sku}</div>
                  {unit.popcornUnit?.batch && (
                    <div className="text-sm text-gray-600">
                      Lote: {unit.popcornUnit.batch.name}
                      {unit.popcornUnit.batch.variant && (
                        <> | Variante: {unit.popcornUnit.batch.variant.weight}g</>
                      )}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}

        <p className="mt-2 text-xs text-gray-500">
          Deixe em branco para liberar todas as unidades do evento
        </p>
      </div>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || currentlyAllocated.length === 0}
          className="px-4 py-2 bg-orange-600 text-white rounded-md disabled:opacity-50"
        >
          {isSubmitting ? "Liberando..." : "Liberar Unidades Selecionadas"}
        </button>
      </div>
    </form>
  );
}
```

## 🔷 10. Componente: Lista de Unidades Alocadas

Crie o arquivo `src/components/events/AllocatedUnitsList.tsx`:

```typescript
// src/components/events/AllocatedUnitsList.tsx
"use client";

import type { AllocatedUnit } from "@/types/events";

interface AllocatedUnitsListProps {
  units: AllocatedUnit[];
}

export function AllocatedUnitsList({ units }: AllocatedUnitsListProps) {
  const currentlyAllocated = units.filter((u) => !u.releasedAt);
  const released = units.filter((u) => u.releasedAt);

  return (
    <div className="space-y-6">
      {/* Unidades Atualmente Alocadas */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Unidades Atualmente Alocadas ({currentlyAllocated.length})
        </h3>
        {currentlyAllocated.length === 0 ? (
          <p className="text-gray-500">Nenhuma unidade alocada</p>
        ) : (
          <div className="space-y-2">
            {currentlyAllocated.map((unit) => (
              <div
                key={unit.id}
                className="p-4 border border-gray-200 rounded-md flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">
                    SKU: {unit.popcornUnit?.sku || "N/A"}
                  </div>
                  {unit.popcornUnit?.batch && (
                    <div className="text-sm text-gray-600">
                      Lote: {unit.popcornUnit.batch.name}
                      {unit.popcornUnit.batch.variant && (
                        <>
                          {" | "}
                          Variante: {unit.popcornUnit.batch.variant.weight}g
                          {" | "}
                          Preço: {unit.popcornUnit.batch.variant.retailPrice} €
                        </>
                      )}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Alocada em: {new Date(unit.allocatedAt).toLocaleString("pt-PT")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unidades Liberadas */}
      {released.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Unidades Liberadas ({released.length})
          </h3>
          <div className="space-y-2">
            {released.map((unit) => (
              <div
                key={unit.id}
                className="p-4 border border-gray-200 rounded-md bg-gray-50 opacity-75"
              >
                <div className="font-medium">
                  SKU: {unit.popcornUnit?.sku || "N/A"}
                </div>
                {unit.popcornUnit?.batch && (
                  <div className="text-sm text-gray-600">
                    Lote: {unit.popcornUnit.batch.name}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Liberada em: {unit.releasedAt && new Date(unit.releasedAt).toLocaleString("pt-PT")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## 🔷 11. Páginas Next.js

### Página: Lista de Eventos

Crie o arquivo `src/app/events/page.tsx`:

```typescript
// src/app/events/page.tsx
import { EventsList } from "@/components/events/EventsList";

export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <EventsList />
    </div>
  );
}
```

### Página: Criar Evento

Crie o arquivo `src/app/events/new/page.tsx`:

```typescript
// src/app/events/new/page.tsx
"use client";

import { CreateEventForm } from "@/components/events/CreateEventForm";
import { useSession } from "next-auth/react"; // ou seu hook de autenticação

export default function NewEventPage() {
  // Obter ID do usuário logado
  const { data: session } = useSession();
  const internalOwnerId = session?.user?.id || "";

  if (!internalOwnerId) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Criar Novo Evento</h1>
      <CreateEventForm
        internalOwnerId={internalOwnerId}
        onSuccess={(event) => {
          // Redirecionar para página do evento
        }}
      />
    </div>
  );
}
```

### Página: Detalhes do Evento

Crie o arquivo `src/app/events/[id]/page.tsx`:

```typescript
// src/app/events/[id]/page.tsx
import { EventDetails } from "@/components/events/EventDetails";
import { AllocatedUnitsList } from "@/components/events/AllocatedUnitsList";
import { AllocateUnitsForm } from "@/components/events/AllocateUnitsForm";
import { ReleaseUnitsForm } from "@/components/events/ReleaseUnitsForm";
import { getEventById } from "@/lib/api/events";

interface EventPageProps {
  params: {
    id: string;
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventById(params.id);

  // Buscar unidades alocadas com detalhes completos
  const eventWithDetails = await getEventById(params.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <EventDetails eventId={params.id} />

      {/* Seção de Alocação de Unidades */}
      <div className="mt-8 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Gerenciar Unidades</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Alocação */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Alocar Unidades</h3>
            <AllocateUnitsForm
              eventId={params.id}
              onSuccess={() => {
                // Recarregar dados do evento
              }}
            />
          </div>

          {/* Formulário de Liberação */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liberar Unidades</h3>
            <ReleaseUnitsForm
              eventId={params.id}
              allocatedUnits={eventWithDetails.allocatedUnits || []}
              onSuccess={() => {
                // Recarregar dados do evento
              }}
            />
          </div>
        </div>

        {/* Lista de Unidades Alocadas */}
        {eventWithDetails.allocatedUnits && eventWithDetails.allocatedUnits.length > 0 && (
          <div className="mt-8">
            <AllocatedUnitsList units={eventWithDetails.allocatedUnits} />
          </div>
        )}
      </div>
    </div>
  );
}
```

### Página: Editar Evento

Crie o arquivo `src/app/events/[id]/edit/page.tsx`:

```typescript
// src/app/events/[id]/edit/page.tsx
import { UpdateEventForm } from "@/components/events/UpdateEventForm";
import { getEventById } from "@/lib/api/events";

interface EditEventPageProps {
  params: {
    id: string;
  };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const event = await getEventById(params.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Editar Evento</h1>
      <UpdateEventForm
        event={event}
        onSuccess={(updatedEvent) => {
          // Redirecionar para página do evento
        }}
      />
    </div>
  );
}
```

## 🔷 12. Hooks Customizados (Opcional)

Crie o arquivo `src/hooks/useEvents.ts`:

```typescript
// src/hooks/useEvents.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  allocateUnitsToEvent,
  releaseUnitsFromEvent,
  type CreateEventInput,
  type UpdateEventInput,
  type AllocateUnitsInput,
  type ReleaseUnitsInput,
} from "@/lib/api/events";

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: () => getEventById(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventInput) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventInput }) =>
      updateEvent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", variables.id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useAllocateUnits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string;
      data: AllocateUnitsInput;
    }) => allocateUnitsToEvent(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useReleaseUnits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string;
      data: ReleaseUnitsInput;
    }) => releaseUnitsFromEvent(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
```

## 🔷 13. Variáveis de Ambiente

Certifique-se de ter no arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## 📝 Resumo das Funcionalidades

### Endpoints Disponíveis:

1. **GET `/events`** - Listar todos os eventos
2. **GET `/events/:id`** - Buscar evento por ID
3. **POST `/events`** - Criar novo evento
4. **PUT `/events/:id`** - Atualizar evento
5. **DELETE `/events/:id`** - Deletar evento (soft delete)
6. **POST `/events/:id/allocate-units`** - Alocar unidades para evento
7. **POST `/events/:id/release-units`** - Liberar unidades do evento

### Componentes Necessários:

1. ✅ `CreateEventForm` - Formulário de criação
2. ✅ `UpdateEventForm` - Formulário de edição
3. ✅ `EventsList` - Lista de eventos
4. ✅ `EventDetails` - Detalhes do evento
5. ✅ `AllocateUnitsForm` - Formulário de alocação
6. ✅ `ReleaseUnitsForm` - Formulário de liberação
7. ✅ `AllocatedUnitsList` - Lista de unidades alocadas

### Fluxo de Trabalho:

1. **Criar Evento** → Evento criado com `allocatedUnits: 0`
2. **Alocar Unidades** → Escolher batches/variants específicos
3. **Gerenciar Unidades** → Visualizar, alocar mais, ou liberar
4. **Atualizar Evento** → Editar informações do evento
5. **Finalizar Evento** → Adicionar avaliação pós-evento

## 🔐 Autenticação

Todas as rotas requerem autenticação (`auth: true` ou `requireRole: "MANAGER"`). Certifique-se de que:

1. O cookie de sessão está sendo enviado (`credentials: "include"`)
2. O usuário tem a role necessária (MANAGER ou ADMIN)
3. A URL da API está configurada corretamente

## 🎨 Estilização

Os exemplos acima usam classes Tailwind CSS básicas. Ajuste conforme seu sistema de design:

- Substitua classes Tailwind por seu sistema de componentes
- Use componentes de UI como shadcn/ui, Material-UI, ou Chakra UI
- Implemente loading states e skeletons
- Adicione animações e transições conforme necessário

## 📚 Referências

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Next.js Forms Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations)

