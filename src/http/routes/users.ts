import { auth } from '@/auth';
import { db } from "@/database/client";
import { users } from "@/database/schema/users";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod/v4";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable()
});


export const usersRoutes = new Elysia()
  .get("/users", async function () {
    const allUsers = await db.query.users.findMany()

    return allUsers
  }, {
    // auth: false,
    detail: {
      summary: "List all users",
      tags: ["Users Route"],
    },
    response: {
      200: z.array(z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        emailVerified: z.boolean(),
        image: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })),
    },
  })

  .get("/users/:id", ({ params, user }: any) => {
    const userId = params.id

    const authenticatedUserName = user?.name

    return { id: userId,name: authenticatedUserName,
    }
  }, {
    auth: true,
    detail: {
      summary: "Get a user by ID",
      tags: ["Users Route"],
    },
    params: z.object({
      id: z.string(),
    }),
    response: {
        200: z.object({
          id: z.string(),
          name: z.string(),
        }),
    },
  })
  .delete("/users/:id", async function ({ params, set }) {
    const userId = params.id

    try {
      const userToDelete = await db.query.users.findFirst({
        where: eq(users.id, userId)
      })

      if (!userToDelete) {
        set.status = 404
        return {
          error: "Usuário não encontrado",
          message: `Usuário com ID ${userId} não existe`
        }
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
        message: "Não foi possível deletar o usuário"
      }
    }
  }, {
    auth: true,
    detail: {
      summary: "Delete a user by ID",
      tags: ["Users Route"],
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