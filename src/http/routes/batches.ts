import { db } from "@/database/client";
import { batches } from "@/database/schema/batches";
import { popcornUnits } from "@/database/schema/popcorn-units";
import { CreateBatchInputSchema, type CreateBatchInputType, SellBatchUnitsInputSchema, type SellBatchUnitsInputType } from "@/database/zod-schemas/batch/batch-input";
import { BatchOutputSchema, type BatchOutputType } from "@/database/zod-schemas/batch/batch-output";
import { and, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod/v4";


type BatchParams = {
  params: {
    id: string
  }
}

export const batchesRoutes = new Elysia()
  .get("/batches", async function () {
    const allBatches = await db.query.batches.findMany({
      with: {
        units: true,
      }
    })

    // Converter Date para string e calcular resumo de unidades
    return allBatches.map((batch) => {
      const unitsSummary = batch.units ? {
        inStock: batch.units.filter(u => u.movementStatus === "in_stock").length,
        sold: batch.units.filter(u => u.movementStatus === "sold").length,
        returned: batch.units.filter(u => u.movementStatus === "returned").length,
        discarded: batch.units.filter(u => u.movementStatus === "discarded").length,
        total: batch.units.length,
      } : {
        inStock: 0,
        sold: 0,
        returned: 0,
        discarded: 0,
        total: 0,
      }

      return {
        ...batch,
        productionDate: batch.productionDate.toISOString(),
        expirationDate: batch.expirationDate.toISOString(),
        createdAt: batch.createdAt.toISOString(),
        updatedAt: batch.updatedAt.toISOString(),
        unitsSummary,
      }
    })
  }, {
    detail: {
      summary: "List all batches",
      tags: ["Products", "Batches"],
    },
  })
  .get("/batches/:id", async function ({ params }: BatchParams): Promise<BatchOutputType> {
    const batchId = params.id

    const batch = await db.query.batches.findFirst({
      where: eq(batches.id, batchId),
      with: {
        units: true,
      }
    })

    if (!batch) {
      throw new Error("Batch not found")
    }

    // Calcular resumo de unidades
    const unitsSummary = batch.units ? {
      inStock: batch.units.filter(u => u.movementStatus === "in_stock").length,
      sold: batch.units.filter(u => u.movementStatus === "sold").length,
      returned: batch.units.filter(u => u.movementStatus === "returned").length,
      discarded: batch.units.filter(u => u.movementStatus === "discarded").length,
      total: batch.units.length,
    } : {
      inStock: 0,
      sold: 0,
      returned: 0,
      discarded: 0,
      total: 0,
    }

    // Converter Date para string para corresponder ao schema
    const formattedBatch = {
      ...batch,
      productionDate: batch.productionDate.toISOString(),
      expirationDate: batch.expirationDate.toISOString(),
      createdAt: batch.createdAt.toISOString(),
      updatedAt: batch.updatedAt.toISOString(),
      unitsSummary,
    }

    return formattedBatch as unknown as BatchOutputType
  }, {
    detail: {
      summary: "Get a batch by ID",
      tags: ["Products", "Batches"],
    },
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: BatchOutputSchema,
    },
  })
  .post("/batches", async function ({ body }: { body: CreateBatchInputType }): Promise<BatchOutputType> {
    // Converter strings de data para Date
    const batchData = {
      name: body.name,
      productVariantId: body.variantId,
      productionDate: new Date(body.productionDate),
      expirationDate: new Date(body.expirationDate),
      quantity: body.quantity.toString(), // numeric precisa ser string
      batchCode: body.batchCode || null,
    }

    const [batch] = await db.insert(batches).values(batchData).returning()

    if (!batch) {
      throw new Error("Failed to create batch")
    }

    // Se createUnits for true, criar unidades automaticamente
    if (body.createUnits !== false) {
      const unitsToCreate = []
      for (let i = 1; i <= body.quantity; i++) {
        unitsToCreate.push({
          batchId: batch.id,
          sku: `${body.batchCode || batch.id}-${i.toString().padStart(3, '0')}`,
          isActive: true,
          isAvailable: true,
          movementStatus: "in_stock" as const,
          sold: false,
        })
      }
      
      if (unitsToCreate.length > 0) {
        await db.insert(popcornUnits).values(unitsToCreate)
      }
    }

    // Buscar batch com unidades para calcular summary
    const batchWithUnits = await db.query.batches.findFirst({
      where: eq(batches.id, batch.id),
      with: {
        units: true,
      }
    })

    // Calcular resumo de unidades
    const unitsSummary = batchWithUnits?.units ? {
      inStock: batchWithUnits.units.filter(u => u.movementStatus === "in_stock").length,
      sold: batchWithUnits.units.filter(u => u.movementStatus === "sold").length,
      returned: batchWithUnits.units.filter(u => u.movementStatus === "returned").length,
      discarded: batchWithUnits.units.filter(u => u.movementStatus === "discarded").length,
      total: batchWithUnits.units.length,
    } : {
      inStock: 0,
      sold: 0,
      returned: 0,
      discarded: 0,
      total: 0,
    }

    // Converter Date para string para corresponder ao schema
    const formattedBatch = {
      ...batch,
      productionDate: batch.productionDate.toISOString(),
      expirationDate: batch.expirationDate.toISOString(),
      createdAt: batch.createdAt.toISOString(),
      updatedAt: batch.updatedAt.toISOString(),
      unitsSummary,
    }

    return formattedBatch as unknown as BatchOutputType
  }, {
    detail: {
      summary: "Create a batch",
      tags: ["Products", "Batches"],
    },
    body: CreateBatchInputSchema,
    response: {
      201: BatchOutputSchema,
    },
  })
  .post("/batches/:id/sell", async function ({ params, body }: { params: { id: string }, body: SellBatchUnitsInputType }): Promise<{ success: boolean; message: string; soldUnits: number; availableUnits: number }> {
    const batchId = params.id

    // Buscar o lote
    const batch = await db.query.batches.findFirst({
      where: eq(batches.id, batchId),
      with: {
        units: true,
      }
    })

    if (!batch) {
      throw new Error("Batch not found")
    }

    // Buscar unidades disponíveis (in_stock)
    const availableUnits = batch.units?.filter(u => 
      u.movementStatus === "in_stock" && 
      u.isAvailable === true && 
      u.sold === false
    ) || []

    if (availableUnits.length < body.quantity) {
      throw new Error(`Quantidade insuficiente. Disponível: ${availableUnits.length}, Solicitado: ${body.quantity}`)
    }

    // Pegar as primeiras N unidades disponíveis
    const unitsToSell = availableUnits.slice(0, body.quantity)

    // Atualizar status das unidades para "sold"
    for (const unit of unitsToSell) {
      await db.update(popcornUnits)
        .set({
          movementStatus: "sold",
          sold: true,
          isAvailable: false,
        })
        .where(eq(popcornUnits.id, unit.id))
    }

    const remainingAvailable = availableUnits.length - body.quantity

    return {
      success: true,
      message: `${body.quantity} unidade(s) vendida(s) com sucesso`,
      soldUnits: body.quantity,
      availableUnits: remainingAvailable,
    }
  }, {
    detail: {
      summary: "Sell units from a batch",
      tags: ["Products", "Batches"],
    },
    params: z.object({
      id: z.string(),
    }),
    body: SellBatchUnitsInputSchema,
    response: {
      200: z.object({
        success: z.boolean(),
        message: z.string(),
        soldUnits: z.number(),
        availableUnits: z.number(),
      }),
    },
  })
  .delete("/batches/:id", async function ({ params }: BatchParams): Promise<{ success: boolean; message: string; }> {
    const batchId = params.id

    const batch = await db.query.batches.findFirst({
      where: eq(batches.id, batchId)
    })

    if (!batch) {
      throw new Error("Batch not found")
    }

    await db.delete(batches).where(eq(batches.id, batchId))

    return {
      success: true,
      message: "Batch deleted successfully",
    }
  }, {
    detail: {
      summary: "Delete a batch",
      tags: ["Products", "Batches"],
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
  })