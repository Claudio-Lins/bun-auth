import { db } from "@/database/client";
import { productVariants } from "@/database/schema/product-variants";
import { CreateVariantInputSchema, type CreateVariantInputType, UpdateVariantInputSchema, type UpdateVariantInputType } from "@/database/zod-schemas/variant/variant-input";
import { VariantOutputSchema, VariantOutputType } from '@/database/zod-schemas/variant/variant-output';
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import z from "zod/v4";

type ProductVariantParams = {
  params: {
    id: string
  }
}

export const productVariantRoutes = new Elysia()
  .get("/product-variants", async function () {
    const allProductVariants = await db.query.productVariants.findMany()

    // Converter Date para string para corresponder ao schema
    return allProductVariants.map((variant) => ({
      ...variant,
      createdAt: variant.createdAt.toISOString(),
      updatedAt: variant.updatedAt.toISOString(),
    }))
  }, {
    detail: {
      summary: "List all product variants",
      tags: ["Products", "Variants"],
    }
  })
  .get("/product-variants/:id", async function ({ params }: ProductVariantParams): Promise<VariantOutputType> {
    const productVariantId = params.id

    const productVariant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, productVariantId)
    })

    if (!productVariant) {
      throw new Error("Product variant not found")
    }

    // Converter Date para string para corresponder ao schema
    const formattedVariant = {
      ...productVariant,
      createdAt: productVariant.createdAt.toISOString(),
      updatedAt: productVariant.updatedAt.toISOString(),
      batches: undefined, // TODO: Calcular baseado nos lotes relacionados
    }

    return formattedVariant as unknown as VariantOutputType
  }, {
    detail: {
      summary: "Get a product variant by ID",
      tags: ["Products", "Variants"],
    },
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: VariantOutputSchema,
    },
  })
  .post("/product-variants", async function ({ body }: { body: CreateVariantInputType }): Promise<VariantOutputType> {
    // Transformar strings vazias em undefined e trim no SKU
    const cleanedBody = {
      ...body,
      retailPrice: body.retailPrice === "" ? undefined : body.retailPrice,
      partnerPrice: body.partnerPrice === "" ? undefined : body.partnerPrice,
      productImageUrl: body.productImageUrl === "" ? undefined : body.productImageUrl,
      sku: body.sku.trim(),
    }

    const [productVariant] = await db.insert(productVariants).values(cleanedBody).returning()

    if (!productVariant) {
      throw new Error("Failed to create product variant")
    }

    // Converter Date para string para corresponder ao schema
    const formattedVariant = {
      ...productVariant,
      createdAt: productVariant.createdAt.toISOString(),
      updatedAt: productVariant.updatedAt.toISOString(),
      batches: undefined, // Variante nova não tem lotes
    }

    return formattedVariant as unknown as VariantOutputType
  }, {
    requireRole: "MANAGER",
    detail: {
      summary: "Create a product variant",
      tags: ["Products", "Variants"],
    },
    body: CreateVariantInputSchema,
    response: {
      201: VariantOutputSchema,
    },
  })
  .put("/product-variants/:id", async function ({ params, body }: { params: { id: string }, body: UpdateVariantInputType }): Promise<VariantOutputType> {
    const variantId = params.id

    // Transformar strings vazias em undefined e trim no SKU se fornecido
    const cleanedBody: any = { ...body }
    if (body.retailPrice !== undefined) {
      cleanedBody.retailPrice = body.retailPrice === "" ? undefined : body.retailPrice
    }
    if (body.partnerPrice !== undefined) {
      cleanedBody.partnerPrice = body.partnerPrice === "" ? undefined : body.partnerPrice
    }
    if (body.productImageUrl !== undefined) {
      cleanedBody.productImageUrl = body.productImageUrl === "" ? undefined : body.productImageUrl
    }
    if (body.sku !== undefined) {
      cleanedBody.sku = body.sku.trim()
    }

    await db.update(productVariants).set(cleanedBody).where(eq(productVariants.id, variantId))

    // Buscar a variante atualizada
    const productVariant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, variantId)
    })

    if (!productVariant) {
      throw new Error("Failed to update product variant")
    }

    // Converter Date para string para corresponder ao schema
    const formattedVariant = {
      ...productVariant,
      createdAt: productVariant.createdAt.toISOString(),
      updatedAt: productVariant.updatedAt.toISOString(),
      batches: undefined, // TODO: Calcular baseado nos lotes relacionados
    }

    return formattedVariant as unknown as VariantOutputType
  }, {
    requireRole: "MANAGER",
    detail: {
      summary: "Update a product variant",
      tags: ["Products", "Variants"],
    },
    params: z.object({
      id: z.string(),
    }),
    body: UpdateVariantInputSchema,
    response: {
      200: VariantOutputSchema,
    },
  })
  .delete("/product-variants/:id", async function ({ params }: ProductVariantParams): Promise<{ success: boolean; message: string; }> {
    const variantId = params.id

    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, variantId)
    })

    if (!variant) {
      throw new Error("Product variant not found")
    }

    await db.delete(productVariants).where(eq(productVariants.id, variantId))

    return {
      success: true,
      message: "Product variant deleted successfully",
    }
  }, {
    requireRole: "MANAGER",
    detail: {
      summary: "Delete a product variant",
      tags: ["Products", "Variants"],
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