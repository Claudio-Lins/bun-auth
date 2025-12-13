import { db } from "@/database/client";
import { products } from "@/database/schema/products";
import { CreateProductInputSchema, CreateProductInputType, UpdateProductInputSchema, UpdateProductInputType } from '@/database/zod-schemas/product/product-input';
import { ProductOutputSchema, ProductOutputType } from '@/database/zod-schemas/product/product-output';
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod/v4";

type ProductParams = {
  params: {
    id: string
  }
}

export const productRoutes = new Elysia()
  .get("/products", async function () {
    const allProducts = await db.query.products.findMany({
      with: {
        variants: true,
      }
    })

    // Converter Date para string para corresponder ao schema
    return allProducts.map((product) => ({
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      variants: product.variants?.map((variant: any) => ({
        ...variant,
        createdAt: variant.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: variant.updatedAt?.toISOString() || new Date().toISOString(),
      })) || undefined,
    }))
  }, {
    detail: {
      summary: "List all products",
      tags: ["Products"],
    },
  })
  .get("/products/:id", async function ({ params }: ProductParams): Promise<ProductOutputType> {
    const productId = params.id

    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: {
        variants: true,
      }   
    })

    if (!product) {
      throw new Error("Product not found")
    }

    // Converter Date para string para corresponder ao schema
    const formattedProduct = {
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      variants: product.variants?.map((variant: any) => ({
        ...variant,
        createdAt: variant.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: variant.updatedAt?.toISOString() || new Date().toISOString(),
      })) || undefined,
    }

    return formattedProduct as unknown as ProductOutputType
  }, {
    detail: {
      summary: "Get a product by ID",
      tags: ["Products"],
    },
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: ProductOutputSchema,
    },
  })
  .post("/products", async function ({ body }: { body: CreateProductInputType }): Promise<ProductOutputType> {
  const [product] = await db.insert(products).values(body).returning()

  if (!product) {
    throw new Error("Failed to create product")
  }

  // Converter Date para string para corresponder ao schema
  const formattedProduct = {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    variants: undefined, // Produto novo não tem variantes
  }

  return formattedProduct as unknown as ProductOutputType
}, {
  detail: {
    summary: "Create a product",
    tags: ["Products"],
  },
  body: CreateProductInputSchema,
  response: {
    201: ProductOutputSchema,
    400: z.object({
      error: z.string(),
      message: z.string(),
    }),
    500: z.object({
      error: z.string(),
      message: z.string(),
    }),
  },
  })
    .put("/products/:id", async function ({ params, body }: { params: { id: string }, body: UpdateProductInputType }): Promise<ProductOutputType> {
      const productId = params.id
      await db.update(products).set(body).where(eq(products.id, productId))

      // Buscar o produto atualizado com variantes
      const product = await db.query.products.findFirst({
        where: eq(products.id, productId),
        with: {
          variants: true,
        }
      })

      if (!product) {
        throw new Error("Failed to update product")
      }

      // Converter Date para string para corresponder ao schema
      const formattedProduct = {
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        variants: product.variants?.map((variant: any) => ({
          ...variant,
          createdAt: variant.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: variant.updatedAt?.toISOString() || new Date().toISOString(),
        })) || undefined,
      }

      return formattedProduct as unknown as ProductOutputType
    }, {
      detail: {
        summary: "Update a product",
        tags: ["Products"],
      },
      params: z.object({
        id: z.string(),
      }),
      body: UpdateProductInputSchema,
      response: {
        200: ProductOutputSchema,
      },
    })
    .delete("/products/:id", async function ({ params }: ProductParams): Promise<{ success: boolean; message: string; }> {
      const productId = params.id

      const product = await db.query.products.findFirst({
        where: eq(products.id, productId)
      })

      if (!product) {
        throw new Error("Product not found")
      }

      await db.delete(products).where(eq(products.id, productId))

      return {
        success: true,
        message: "Product deleted successfully",
      }
    }, {
      detail: {
        summary: "Delete a product",
        tags: ["Products"],
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