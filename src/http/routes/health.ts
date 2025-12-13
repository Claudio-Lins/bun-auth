import { Elysia } from "elysia";
import { z } from "zod/v4";

export const healthRoutes = new Elysia()
  .get("/health", function () {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development"
    }
  }, {
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
  });