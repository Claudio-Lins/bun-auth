import { auth } from "@/auth";
import { db } from "@/database/client";
import { users } from "@/database/schema/users";
import { eq } from "drizzle-orm";
import Elysia from "elysia";

export const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .all("/api/auth/*", async ({ request, set }) => {
    try {
      // Chamar o handler do Better Auth
      const response = await auth.handler(request);
      
      // Copiar status code
      set.status = response.status;
      
      // Coletar todos os cookies Set-Cookie
      const setCookieValues: string[] = [];
      
      // Copiar todos os headers
      response.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'set-cookie') {
          setCookieValues.push(value);
        } else {
          set.headers[key] = value;
        }
      });
      
      // Adicionar todos os cookies Set-Cookie como array
      if (setCookieValues.length > 0) {
        set.headers['set-cookie'] = setCookieValues;
      }
      
      // Obter o corpo da resposta
      const contentType = response.headers.get('content-type') || '';
      let body;
      
      if (contentType.includes('application/json')) {
        body = await response.json();
      } else {
        body = await response.text();
      }
      
      return body;
    } catch (error) {
      console.error('Error in Better Auth handler:', error);
      set.status = 500;
      return { error: 'Internal server error', message: error instanceof Error ? error.message : String(error) };
    }
  })
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers })
        if (!session) {
          return status(401, { message: "Unauthorized" })
        }
        return session
      }
    },
    requireRole: (role: string) => ({
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers })
        if (!session) {
          return status(401, { message: "Unauthorized" })
        }

        // Buscar o usuário completo do banco para verificar a role
        const user = await db.query.users.findFirst({
          where: eq(users.id, session.user.id)
        })

        if (!user) {
          return status(401, { message: "Unauthorized" })
        }

        // Verificar se o usuário tem a role necessária
        const userRole = user.role || "user"
        
        // MANAGER permite manager e admin, ADMIN permite apenas admin
        let allowedRoles: string[] = []
        if (role === "MANAGER") {
          allowedRoles = ["manager", "admin"]
        } else if (role === "ADMIN") {
          allowedRoles = ["admin"]
        } else {
          allowedRoles = [role.toLowerCase()]
        }
        
        if (!allowedRoles.includes(userRole.toLowerCase())) {
          return status(403, { 
            message: "Forbidden", 
            error: `This endpoint requires role: ${role}. Your role: ${userRole}` 
          })
        }

        return { session, user }
      }
    })
  })

 

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())

export const OpenAPI = {
    getPaths: (prefix = '/api/auth') =>
        getSchema().then(({ paths }) => {
            const reference: typeof paths = Object.create(null)

            for (const path of Object.keys(paths)) {
                const key = prefix + path
                reference[key] = paths[path]

                for (const method of Object.keys(paths[path])) {
                    const operation = (reference[key] as any)[method]

                    operation.tags = ['Better Auth']
                }
            }

            return reference
        }) as Promise<any>,
    components: getSchema().then(({ components }) => components) as Promise<any>
} as const