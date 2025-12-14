// src/http/routes/user-addresses.ts
import { db } from "@/database/client";
import { userAddresses } from "@/database/schema/user-addresses";
import { CreateUserAddressInputSchema, CreateUserAddressInputType, UpdateUserAddressInputSchema, UpdateUserAddressInputType } from "@/database/zod-schemas/user-addresses/user-addresses-input";
import { UserAddressOutputSchema, UserAddressOutputType } from "@/database/zod-schemas/user-addresses/user-addresses-output";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod/v4";

type UserAddressParams = {
  params: {
    id: string
  }
}

type UserAddressByUserParams = {
  params: {
    id: string
  }
}

export const userAddressesRoutes = new Elysia()
  .get("/user-addresses", async function (): Promise<UserAddressOutputType[]> {
    const allAddresses = await db.query.userAddresses.findMany()

    // Converter Date para string para corresponder ao schema
    return allAddresses.map((address) => ({
      id: address.id,
      userId: address.userId,
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || "PT",
      isPrimary: address.isPrimary,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    }))
  }, {
    detail: {
      summary: "List all user addresses",
      tags: ["Users", "Addresses"],
    },
    response: {
      200: z.array(UserAddressOutputSchema),
    },
  })
  .get("/user-addresses/:id", async function ({ params }: UserAddressParams): Promise<UserAddressOutputType> {
    const addressId = params.id

    const address = await db.query.userAddresses.findFirst({
      where: eq(userAddresses.id, addressId)
    })

    if (!address) {
      throw new Error("User address not found")
    }

    // Converter Date para string para corresponder ao schema
    const formattedAddress = {
      id: address.id,
      userId: address.userId,
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || "PT",
      isPrimary: address.isPrimary,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    }

    return formattedAddress as unknown as UserAddressOutputType
  }, {
    detail: {
      summary: "Get a user address by ID",
      tags: ["Users", "Addresses"],
    },
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: UserAddressOutputSchema,
    },
  })
  .get("/users/:id/addresses", async function ({ params }: UserAddressByUserParams): Promise<UserAddressOutputType[]> {
    const userId = params.id

    const addresses = await db.query.userAddresses.findMany({
      where: eq(userAddresses.userId, userId)
    })

    // Converter Date para string para corresponder ao schema
    return addresses.map((address) => ({
      id: address.id,
      userId: address.userId,
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || "PT",
      isPrimary: address.isPrimary,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    }))
  }, {
    detail: {
      summary: "Get all addresses for a user",
      tags: ["Users", "Addresses"],
    },
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: z.array(UserAddressOutputSchema),
    },
  })
  .post("/user-addresses", async function ({ body }: { body: CreateUserAddressInputType }): Promise<UserAddressOutputType> {
    const [address] = await db.insert(userAddresses).values(body).returning()

    if (!address) {
      throw new Error("Failed to create user address")
    }

    // Converter Date para string para corresponder ao schema
    const formattedAddress = {
      id: address.id,
      userId: address.userId,
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || "PT",
      isPrimary: address.isPrimary,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    }

    return formattedAddress as unknown as UserAddressOutputType
  }, {
    detail: {
      summary: "Create a user address",
      tags: ["Users", "Addresses"],
    },
    body: CreateUserAddressInputSchema,
    response: {
      201: UserAddressOutputSchema,
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
  .put("/user-addresses/:id", async function ({ params, body, set }: { params: { id: string }, body: UpdateUserAddressInputType, set: any }): Promise<UserAddressOutputType> {
    const addressId = params.id

    try {
      // Verificar se o endereço existe
      const existingAddress = await db.query.userAddresses.findFirst({
        where: eq(userAddresses.id, addressId)
      })

      if (!existingAddress) {
        set.status = 404
        throw new Error("User address not found")
      }

      // Filtrar campos undefined para evitar problemas no update
      const updateData: any = {}
      if (body.street !== undefined) updateData.street = body.street
      if (body.number !== undefined) updateData.number = body.number
      if (body.complement !== undefined) updateData.complement = body.complement
      if (body.neighborhood !== undefined) updateData.neighborhood = body.neighborhood
      if (body.city !== undefined) updateData.city = body.city
      if (body.state !== undefined) updateData.state = body.state
      if (body.postalCode !== undefined) updateData.postalCode = body.postalCode
      if (body.country !== undefined) updateData.country = body.country
      if (body.isPrimary !== undefined) updateData.isPrimary = body.isPrimary

      // Verificar se há dados para atualizar
      if (Object.keys(updateData).length === 0) {
        set.status = 400
        throw new Error("No fields to update")
      }

      await db.update(userAddresses).set(updateData).where(eq(userAddresses.id, addressId))

      // Buscar o endereço atualizado
      const address = await db.query.userAddresses.findFirst({
        where: eq(userAddresses.id, addressId)
      })

      if (!address) {
        set.status = 404
        throw new Error("Failed to update user address")
      }

      // Converter Date para string para corresponder ao schema
      const formattedAddress = {
        id: address.id,
        userId: address.userId,
        street: address.street,
        number: address.number,
        complement: address.complement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country || "PT",
        isPrimary: address.isPrimary,
        createdAt: address.createdAt.toISOString(),
        updatedAt: address.updatedAt.toISOString(),
      }

      return formattedAddress as unknown as UserAddressOutputType
    } catch (err: any) {
      console.log(JSON.stringify({ error: "Erro ao atualizar endereço", details: err }, null, 2))
      
      if (set.status === 404 || set.status === 400) {
        throw err
      }
      
      set.status = 500
      throw new Error("Failed to update user address")
    }
  }, {
    detail: {
      summary: "Update a user address",
      tags: ["Users", "Addresses"],
    },
    params: z.object({
      id: z.string(),
    }),
    body: UpdateUserAddressInputSchema,
    response: {
      200: UserAddressOutputSchema,
      400: z.object({
        error: z.string(),
        message: z.string(),
      }),
      404: z.object({
        error: z.string(),
        message: z.string(),
      }),
      500: z.object({
        error: z.string(),
        message: z.string(),
      }),
    },
  })
  .delete("/user-addresses/:id", async function ({ params }: UserAddressParams): Promise<{ success: boolean; message: string }> {
    const addressId = params.id

    const address = await db.query.userAddresses.findFirst({
      where: eq(userAddresses.id, addressId)
    })

    if (!address) {
      throw new Error("User address not found")
    }

    await db.delete(userAddresses).where(eq(userAddresses.id, addressId))

    console.log(JSON.stringify({ message: `Endereço ${addressId} deletado com sucesso` }, null, 2))

    return {
      success: true,
      message: "Endereço deletado com sucesso",
    }
  }, {
    detail: {
      summary: "Delete a user address",
      tags: ["Users", "Addresses"],
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

