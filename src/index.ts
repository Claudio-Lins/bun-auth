import { auth } from "@/auth";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod/v4";
import { db } from "./database/client";
import { users } from "./database/schema/users";
import { betterAuthPlugin, OpenAPI } from "./http/plugins/better-auth";
  

const app = new Elysia()
  .use(cors({
    origin: "http://localhost:3000",
    credentials: true,
  }))
  .use(openapi({
    mapJsonSchema: {
      zod: z.toJSONSchema
    },
     documentation: {
            components: await OpenAPI.components,
            paths: await OpenAPI.getPaths()
        }
  }))
  .use(betterAuthPlugin)
  .get("/", () => "Hello Elysia")
  .get("/health", function () {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development"
    }
  }, {
    auth: false,
    detail: {
      summary: "Health check endpoint",
      tags: ["health"],
    },
    response: {
      200: z.object({
        status: z.string(),
        timestamp: z.string(),
        uptime: z.number(),
        environment: z.string(),
      }),
    },
  })
  .get("/users", async function () {
    const allUsers = await db.query.users.findMany()

    return allUsers
  }, {
    auth: false,
    detail: {
      summary: "List all users",
      tags: ["users"],
    },
    response: {
      200: z.array(z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        emailVerified: z.boolean(),
        image: z.string().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })),
    },
  })
  .get("/users/:id", ({ params, user }) => {
    const userId = params.id

    const authenticatedUserName = user.name

    console.log(authenticatedUserName)

    return { id: userId,name: authenticatedUserName,
    }
  }, {
    auth: true,
    detail: {
      summary: "Get a user by ID",
      tags: ["users"],
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
      tags: ["users"],
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

app.listen({
  port: Number(process.env.PORT) || 3333,
  hostname: "0.0.0.0"
});

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
