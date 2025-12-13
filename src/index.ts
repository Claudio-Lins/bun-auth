import { auth } from "@/auth";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod/v4";
import { db } from "./database/client";

import { betterAuthPlugin, OpenAPI } from "./http/plugins/better-auth";
import { routes } from "./http/routes";
  

const app = new Elysia()
  .use(cors({
    origin: "*",
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
  .use(routes)

app.listen({
  port: Number(process.env.PORT) || 3333,
  hostname: "0.0.0.0"
});

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
