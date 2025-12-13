import { db } from "@/database/client";
import { productVariants } from "@/database/schema/product-variants";
import { CreateVariantInputSchema, type CreateVariantInputType } from "@/database/zod-schemas/variant/variant-input";
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

    return allProductVariants
  }, {
    detail: {
      summary: "List all product variants",
      tags: ["Product Route"],
    }
  })
  .get("/product-variants/:id", async function ({ params }: ProductVariantParams): Promise<VariantOutputType> {
    const productVariantId = params.id

    const productVariant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, productVariantId)
    })

    return productVariant as unknown as VariantOutputType
  }, {
    detail: {
      summary: "Get a product variant by ID",
      tags: ["Product Route"],
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

    return productVariant as unknown as VariantOutputType
  }, {
    detail: {
      summary: "Create a product variant",
      tags: ["Product Route"],
    },
    body: CreateVariantInputSchema,
    response: {
      201: VariantOutputSchema,
    },
  })