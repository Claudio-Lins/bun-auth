import { db } from "@/database/client";
import { popcornUnits } from "@/database/schema/popcorn-units";
import { CreatePopcornUnitInputSchema, CreatePopcornUnitInputType, UpdatePopcornUnitInputSchema, UpdatePopcornUnitInputType } from '@/database/zod-schemas/unit/unit-input';
import { PopcornUnitOutputSchema, PopcornUnitOutputType } from '@/database/zod-schemas/unit/unit-output';
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod/v4";

type PopcornUnitParams = {
  params: {
    id: string
  }
}

export const popcornUnitRoutes = new Elysia()
  .get("/popcorn-units", async function () {
    const allPopcornUnits = await db.query.popcornUnits.findMany()

    // Converter Date para string para corresponder ao schema
    return allPopcornUnits.map((unit) => ({
      ...unit,
      returnDate: unit.returnDate ? unit.returnDate.toISOString() : null,
      createdAt: unit.createdAt.toISOString(),
      updatedAt: unit.updatedAt.toISOString(),
    }))
  }, {
    detail: {
      summary: "List all popcorn units",
      tags: ["Popcorn Unit Route"],
    },
  })
  .get("/popcorn-units/:id", async function ({ params }: PopcornUnitParams): Promise<PopcornUnitOutputType> {
    const unitId = params.id

    const unit = await db.query.popcornUnits.findFirst({
      where: eq(popcornUnits.id, unitId),
    })

    if (!unit) {
      throw new Error("Popcorn unit not found")
    }

    // Converter Date para string para corresponder ao schema
    const formattedUnit = {
      ...unit,
      returnDate: unit.returnDate ? unit.returnDate.toISOString() : undefined,
      createdAt: unit.createdAt.toISOString(),
      updatedAt: unit.updatedAt.toISOString(),
    }

    return formattedUnit as unknown as PopcornUnitOutputType
  }, {
    detail: {
      summary: "Get a popcorn unit by ID",
      tags: ["Popcorn Unit Route"],
    },
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: PopcornUnitOutputSchema,
    },
  })
  .post("/popcorn-units", async function ({ body }: { body: CreatePopcornUnitInputType }): Promise<PopcornUnitOutputType> {
    const [unit] = await db.insert(popcornUnits).values(body).returning()

    if (!unit) {
      throw new Error("Failed to create popcorn unit")
    }

    // Converter Date para string para corresponder ao schema
    const formattedUnit = {
      ...unit,
      returnDate: unit.returnDate ? unit.returnDate.toISOString() : undefined,
      createdAt: unit.createdAt.toISOString(),
      updatedAt: unit.updatedAt.toISOString(),
    }

    return formattedUnit as unknown as PopcornUnitOutputType
  }, {
    detail: {
      summary: "Create a popcorn unit",
      tags: ["Popcorn Unit Route"],
    },
    body: CreatePopcornUnitInputSchema,
    response: {
      201: PopcornUnitOutputSchema,
    },
  })
  .put("/popcorn-units/:id", async function ({ params, body }: { params: { id: string }, body: UpdatePopcornUnitInputType }): Promise<PopcornUnitOutputType> {
    const unitId = params.id

    // Converter returnDate de string para Date se fornecido
    const updateData: any = { ...body }
    if (body.returnDate !== undefined) {
      updateData.returnDate = body.returnDate === "" || body.returnDate === null ? null : new Date(body.returnDate)
    }

    await db.update(popcornUnits).set(updateData).where(eq(popcornUnits.id, unitId))

    // Buscar a unidade atualizada
    const unit = await db.query.popcornUnits.findFirst({
      where: eq(popcornUnits.id, unitId),
    })

    if (!unit) {
      throw new Error("Failed to update popcorn unit")
    }

    // Converter Date para string para corresponder ao schema
    const formattedUnit = {
      ...unit,
      returnDate: unit.returnDate ? unit.returnDate.toISOString() : undefined,
      createdAt: unit.createdAt.toISOString(),
      updatedAt: unit.updatedAt.toISOString(),
    }

    return formattedUnit as unknown as PopcornUnitOutputType
  }, {
    detail: {
      summary: "Update a popcorn unit",
      tags: ["Popcorn Unit Route"],
    },
    params: z.object({
      id: z.string(),
    }),
    body: UpdatePopcornUnitInputSchema,
    response: {
      200: PopcornUnitOutputSchema,
    },
  })
  .delete("/popcorn-units/:id", async function ({ params }: PopcornUnitParams): Promise<{ success: boolean; message: string; }> {
    const unitId = params.id

    const unit = await db.query.popcornUnits.findFirst({
      where: eq(popcornUnits.id, unitId),
    })

    if (!unit) {
      throw new Error("Popcorn unit not found")
    }

    await db.delete(popcornUnits).where(eq(popcornUnits.id, unitId))

    return {
      success: true,
      message: "Popcorn unit deleted successfully",
    }
  }, {
    detail: {
      summary: "Delete a popcorn unit",
      tags: ["Popcorn Unit Route"],
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
