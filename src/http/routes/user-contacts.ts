// src/http/routes/user-contacts.ts
import { db } from "@/database/client";
import { userContacts } from "@/database/schema/user-contacts";
import { CreateUserContactInputSchema, CreateUserContactInputType, UpdateUserContactInputSchema, UpdateUserContactInputType } from "@/database/zod-schemas/user-contacts/user-contacts-input";
import { UserContactOutputSchema, UserContactOutputType } from "@/database/zod-schemas/user-contacts/user-contacts-output";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod/v4";

type UserContactParams = {
  params: {
    id: string
  }
}

type UserContactByUserParams = {
  params: {
    id: string
  }
}

export const userContactsRoutes = new Elysia()
  .get("/user-contacts", async function (): Promise<UserContactOutputType[]> {
    const allContacts = await db.query.userContacts.findMany()

    // Converter Date para string para corresponder ao schema
    return allContacts.map((contact) => ({
      id: contact.id,
      userId: contact.userId,
      phone: contact.phone,
      countryCode: contact.countryCode || "351",
      isPrimary: contact.isPrimary,
      verified: contact.verified,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    }))
  }, {
    detail: {
      summary: "List all user contacts",
      tags: ["Users", "Contacts"],
    },
    response: {
      200: z.array(UserContactOutputSchema),
    },
  })
  .get("/user-contacts/:id", async function ({ params }: UserContactParams): Promise<UserContactOutputType> {
    const contactId = params.id

    const contact = await db.query.userContacts.findFirst({
      where: eq(userContacts.id, contactId)
    })

    if (!contact) {
      throw new Error("User contact not found")
    }

    // Converter Date para string para corresponder ao schema
    const formattedContact = {
      id: contact.id,
      userId: contact.userId,
      phone: contact.phone,
      countryCode: contact.countryCode || "351",
      isPrimary: contact.isPrimary,
      verified: contact.verified,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    }

    return formattedContact as unknown as UserContactOutputType
  }, {
    detail: {
      summary: "Get a user contact by ID",
      tags: ["Users", "Contacts"],
    },
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: UserContactOutputSchema,
    },
  })
  .get("/users/:id/contacts", async function ({ params }: UserContactByUserParams): Promise<UserContactOutputType[]> {
    const userId = params.id

    const contacts = await db.query.userContacts.findMany({
      where: eq(userContacts.userId, userId)
    })

    // Converter Date para string para corresponder ao schema
    return contacts.map((contact) => ({
      id: contact.id,
      userId: contact.userId,
      phone: contact.phone,
      countryCode: contact.countryCode || "351",
      isPrimary: contact.isPrimary,
      verified: contact.verified,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    }))
  }, {
    detail: {
      summary: "Get all contacts for a user",
      tags: ["Users", "Contacts"],
    },
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: z.array(UserContactOutputSchema),
    },
  })
  .post("/user-contacts", async function ({ body }: { body: CreateUserContactInputType }): Promise<UserContactOutputType> {
    const [contact] = await db.insert(userContacts).values(body).returning()

    if (!contact) {
      throw new Error("Failed to create user contact")
    }

    // Converter Date para string para corresponder ao schema
    const formattedContact = {
      id: contact.id,
      userId: contact.userId,
      phone: contact.phone,
      countryCode: contact.countryCode || "351",
      isPrimary: contact.isPrimary,
      verified: contact.verified,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    }

    return formattedContact as unknown as UserContactOutputType
  }, {
    detail: {
      summary: "Create a user contact",
      tags: ["Users", "Contacts"],
    },
    body: CreateUserContactInputSchema,
    response: {
      201: UserContactOutputSchema,
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
  .put("/user-contacts/:id", async function ({ params, body, set }: { params: { id: string }, body: UpdateUserContactInputType, set: any }): Promise<UserContactOutputType> {
    const contactId = params.id

    try {
      // Verificar se o contato existe
      const existingContact = await db.query.userContacts.findFirst({
        where: eq(userContacts.id, contactId)
      })

      if (!existingContact) {
        set.status = 404
        throw new Error("User contact not found")
      }

      // Filtrar campos undefined para evitar problemas no update
      const updateData: any = {}
      if (body.phone !== undefined) updateData.phone = body.phone
      if (body.countryCode !== undefined) updateData.countryCode = body.countryCode
      if (body.isPrimary !== undefined) updateData.isPrimary = body.isPrimary
      if (body.verified !== undefined) updateData.verified = body.verified

      // Verificar se há dados para atualizar
      if (Object.keys(updateData).length === 0) {
        set.status = 400
        throw new Error("No fields to update")
      }

      await db.update(userContacts).set(updateData).where(eq(userContacts.id, contactId))

      // Buscar o contato atualizado
      const contact = await db.query.userContacts.findFirst({
        where: eq(userContacts.id, contactId)
      })

      if (!contact) {
        set.status = 404
        throw new Error("Failed to update user contact")
      }

      // Converter Date para string para corresponder ao schema
      const formattedContact = {
        id: contact.id,
        userId: contact.userId,
        phone: contact.phone,
        countryCode: contact.countryCode || "351",
        isPrimary: contact.isPrimary,
        verified: contact.verified,
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString(),
      }

      return formattedContact as unknown as UserContactOutputType
    } catch (err: any) {
      console.log(JSON.stringify({ error: "Erro ao atualizar contato", details: err }, null, 2))
      
      if (set.status === 404 || set.status === 400) {
        throw err
      }
      
      set.status = 500
      throw new Error("Failed to update user contact")
    }
  }, {
    detail: {
      summary: "Update a user contact",
      tags: ["Users", "Contacts"],
    },
    params: z.object({
      id: z.string(),
    }),
    body: UpdateUserContactInputSchema,
    response: {
      200: UserContactOutputSchema,
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
  .delete("/user-contacts/:id", async function ({ params }: UserContactParams): Promise<{ success: boolean; message: string }> {
    const contactId = params.id

    const contact = await db.query.userContacts.findFirst({
      where: eq(userContacts.id, contactId)
    })

    if (!contact) {
      throw new Error("User contact not found")
    }

    await db.delete(userContacts).where(eq(userContacts.id, contactId))

    console.log(JSON.stringify({ message: `Contato ${contactId} deletado com sucesso` }, null, 2))

    return {
      success: true,
      message: "Contato deletado com sucesso",
    }
  }, {
    detail: {
      summary: "Delete a user contact",
      tags: ["Users", "Contacts"],
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

