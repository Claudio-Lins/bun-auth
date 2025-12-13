import { auth } from "@/auth";
import { db } from "@/database/client";
import { users } from "@/database/schema/users";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod/v4";

type AdminParams = {
  params: {
    id: string
  }
}

const UpdateUserRoleSchema = z.object({
  role: z.enum(["user", "manager", "admin"], {
    errorMap: () => ({ message: "Role deve ser: user, manager ou admin" })
  }),
});

export const adminRoutes = new Elysia()
  .get("/admin/users", async function () {

    const allUsers = await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    })

    return allUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role || "user",
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }))
  }, {
    requireRole: "ADMIN",
    detail: {
      summary: "List all users (Admin only)",
      tags: ["Admin"],
    },
    response: {
      200: z.array(z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        emailVerified: z.boolean(),
        image: z.string().nullable(),
        role: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })),
    },
  })
  .get("/admin/users/:id", async function ({ params }: { params: { id: string } }) {
    const userId = params.id

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    })

    if (!user) {
      throw new Error("User not found")
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role || "user",
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }
  }, {
    requireRole: "ADMIN",
    detail: {
      summary: "Get user by ID (Admin only)",
      tags: ["Admin"],
    },
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        emailVerified: z.boolean(),
        image: z.string().nullable(),
        role: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      }),
    },
  })
  .put("/admin/users/:id/role", async function ({ params, body }: { params: { id: string }, body: z.infer<typeof UpdateUserRoleSchema> }) {
    const userId = params.id

    // Verificar se o usuário existe
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Atualizar a role do usuário
    await db.update(users)
      .set({ role: body.role })
      .where(eq(users.id, userId))

    // Buscar o usuário atualizado
    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    })

    return {
      success: true,
      message: `User role updated to ${body.role}`,
      user: {
        id: updatedUser!.id,
        name: updatedUser!.name,
        email: updatedUser!.email,
        role: updatedUser!.role,
      }
    }
  }, {
    requireRole: "ADMIN",
    detail: {
      summary: "Update user role (Admin only)",
      tags: ["Admin"],
    },
    params: z.object({
      id: z.string(),
    }),
    body: UpdateUserRoleSchema,
    response: {
      200: z.object({
        success: z.boolean(),
        message: z.string(),
        user: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          role: z.string(),
        }),
      }),
    },
  })

