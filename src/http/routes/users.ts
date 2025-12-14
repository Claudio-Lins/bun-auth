// src/http/routes/users.ts
import { auth } from '@/auth';
import { db } from "@/database/client";
import { users } from "@/database/schema/users";
import { CreateUserInputSchema, CreateUserInputType, UpdateUserInputSchema, UpdateUserInputType } from "@/database/zod-schemas/users/users-input";
import { UserOutputSchema, UserOutputType } from "@/database/zod-schemas/users/users-output";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod/v4";

type UserParams = {
  params: {
    id: string
  }
}

// Função auxiliar para formatar usuário com relações
function formatUserWithRelations(user: any): UserOutputType {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    role: user.role || "user",
    banned: user.banned || null,
    banReason: user.banReason || null,
    banExpires: user.banExpires ? user.banExpires.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    contacts: user.contacts?.map((contact: any) => ({
      id: contact.id,
      userId: contact.userId,
      phone: contact.phone,
      countryCode: contact.countryCode || "351",
      isPrimary: contact.isPrimary,
      verified: contact.verified,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    })),
    addresses: user.addresses?.map((address: any) => ({
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
    })),
  }
}

export const usersRoutes = new Elysia()
  .get("/users", async function (): Promise<UserOutputType[]> {
    const allUsers = await db.query.users.findMany({
      with: {
        contacts: true,
        addresses: true,
      }
    })

    // Converter Date para string para corresponder ao schema
    return allUsers.map((user) => formatUserWithRelations(user))
  }, {
    detail: {
      summary: "List all users",
      tags: ["Users"],
    },
    response: {
      200: z.array(UserOutputSchema),
    },
  })
  .get("/users/:id", async function ({ params }: UserParams): Promise<UserOutputType> {
    const userId = params.id

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        contacts: true,
        addresses: true,
      }
    })

    if (!user) {
      throw new Error("User not found")
    }

    return formatUserWithRelations(user)
  }, {
    auth: true,
    detail: {
      summary: "Get a user by ID",
      tags: ["Users"],
    },
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: UserOutputSchema,
    },
  })
  .post("/users", async function ({ body }: { body: CreateUserInputType }): Promise<UserOutputType> {
    const [user] = await db.insert(users).values(body).returning()

    if (!user) {
      throw new Error("Failed to create user")
    }

    // Buscar o usuário criado com relações (vazias inicialmente)
    const userWithRelations = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      with: {
        contacts: true,
        addresses: true,
      }
    })

    if (!userWithRelations) {
      throw new Error("Failed to create user")
    }

    return formatUserWithRelations(userWithRelations)
  }, {
    detail: {
      summary: "Create a user",
      tags: ["Users"],
    },
    body: CreateUserInputSchema,
    response: {
      201: UserOutputSchema,
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
  .put("/users/:id", async function ({ params, body }: { params: { id: string }, body: UpdateUserInputType }): Promise<UserOutputType> {
    const userId = params.id

    // Converter banExpires de string para Date se fornecido
    const updateData: any = { ...body }
    if (body.banExpires) {
      updateData.banExpires = new Date(body.banExpires)
    }

    await db.update(users).set(updateData).where(eq(users.id, userId))

    // Buscar o usuário atualizado
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        contacts: true,
        addresses: true,
      }
    })

    if (!user) {
      throw new Error("Failed to update user")
    }

    return formatUserWithRelations(user)
  }, {
    auth: true,
    detail: {
      summary: "Update a user",
      tags: ["Users"],
    },
    params: z.object({
      id: z.string(),
    }),
    body: UpdateUserInputSchema,
    response: {
      200: UserOutputSchema,
    },
  })
  .delete("/users/:id", async function ({ params, set }): Promise<{ success: boolean; message: string; deletedUserId: string }> {
    const userId = params.id

    try {
      const userToDelete = await db.query.users.findFirst({
        where: eq(users.id, userId)
      })

      if (!userToDelete) {
        set.status = 404
        return {
          error: "Usuário não encontrado",
          message: `Usuário com ID ${userId} não existe`,
          success: false,
          deletedUserId: userId
        } as any
      }

      await db.delete(users).where(eq(users.id, userId))

      console.log(JSON.stringify({ message: `Usuário ${userId} deletado com sucesso` }, null, 2))

      return {
        success: true,
        message: "Usuário deletado com sucesso",
        deletedUserId: userId
      }
    } catch (err) {
      console.log(JSON.stringify({ error: "Erro ao deletar usuário", details: err }, null, 2))
      
      set.status = 500
      return {
        error: "Erro interno do servidor",
        message: "Não foi possível deletar o usuário",
        success: false,
        deletedUserId: userId
      } as any
    }
  }, {
    auth: true,
    detail: {
      summary: "Delete a user by ID",
      tags: ["Users"],
    },
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: z.object({
        success: z.boolean(),
        message: z.string(),
        deletedUserId: z.string(),
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
  });