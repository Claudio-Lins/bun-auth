import { auth } from "@/auth";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { z } from "zod/v4";

import { betterAuthPlugin, OpenAPI } from "./http/plugins/better-auth";
import { routes } from "./http/routes";

async function startServer() {
  try {
    console.log("Starting server...");
    console.log("Environment variables:", {
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "***configured***" : "missing",
    });

    // Configurar origens permitidas para CORS
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : [
          "http://localhost:3000",
          "https://admin.popjoypipocas.com",
          "https://popjoy-api.claudiolins.eu"
        ];

    const app = new Elysia()
      .use(cors({
        origin: allowedOrigins,
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

    const port = Number(process.env.PORT) || 3333;
    const hostname = "0.0.0.0";

    app.listen({
      port,
      hostname
    });

    console.log(
      `🦊 Elysia is running at ${hostname}:${port}`
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    console.error(JSON.stringify({ error: String(error), stack: error instanceof Error ? error.stack : undefined }, null, 2));
    process.exit(1);
  }
}

startServer();
