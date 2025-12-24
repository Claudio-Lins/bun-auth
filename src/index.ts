import { auth } from "@/auth";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { z } from "zod/v4";

import { betterAuthPlugin, OpenAPI } from "./http/plugins/better-auth";
import { routes } from "./http/routes";

// Configurar baseURL para produção (necessário para cookies funcionarem corretamente)
// Usar função para evitar problemas com minificação do Bun
function getBaseURL(): string {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://popjoy-api.claudiolins.eu';
  }
  return 'http://localhost:3333';
}
const baseURL = getBaseURL();


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
      .onRequest(function ({ request }) {
        const origin = request.headers.get('origin') || 'N/A';
        const method = request.method;
        const url = request.url;
        const path = url ? new URL(url).pathname : url;
        const timestamp = new Date().toISOString();
        
        // Log cookies recebidos (apenas para rotas de auth)
        if (path.startsWith('/api/auth')) {
          const cookieHeader = request.headers.get('cookie') || '';
          if (cookieHeader) {
            const cookies = cookieHeader.split(';').map(c => c.trim().split('=')[0]);
            console.log(`🍪 Cookies recebidos (${cookies.length}): ${cookies.join(', ')}`);
          } else {
            console.log(`⚠️  Nenhum cookie recebido na requisição ${path}`);
          }
        }
        
        console.log(`[${timestamp}] 📥 ${method} ${path} | Origin: ${origin}`);
      })
      .onAfterHandle(function ({ request, set }) {
        const origin = request.headers.get('origin') || 'N/A';
        const method = request.method;
        const url = request.url;
        const path = url ? new URL(url).pathname : url;
        const status = set.status || 200;
        const timestamp = new Date().toISOString();
        
        // Log cookies sendo enviados (apenas para rotas de auth)
        if (path.startsWith('/api/auth')) {
          const allHeaders = set.headers || {};
          const cookies = allHeaders['set-cookie'] || allHeaders['Set-Cookie'] || [];
          const cookieArray = Array.isArray(cookies) ? cookies : (cookies ? [cookies] : []);
          
          if (cookieArray.length > 0) {
            console.log(`🍪 Cookies sendo enviados (${cookieArray.length}):`, cookieArray.map(c => {
              const cookieStr = typeof c === 'string' ? c : String(c);
              return cookieStr.split(';')[0];
            }).join(', '));
            // Log completo do cookie para debug
            console.log(`🔍 Cookie completo:`, cookieArray[0]);
          } else {
            console.log(`⚠️  Nenhum cookie sendo enviado para ${path}`);
            console.log(`🔍 Todos os headers da resposta:`, JSON.stringify(allHeaders, null, 2));
          }
        }
        
        const statusColor = status >= 500 ? '🔴' : status >= 400 ? '🟡' : status >= 300 ? '🔵' : '🟢';
        console.log(`[${timestamp}] ${statusColor} ${method} ${path} ${status} | Origin: ${origin}`);
      })
      .onError(function ({ error, request }) {
        const origin = request.headers.get('origin') || 'N/A';
        const method = request.method;
        const url = request.url;
        const path = url ? new URL(url).pathname : url;
        const timestamp = new Date().toISOString();
        
        console.error(`[${timestamp}] ❌ ERROR ${method} ${path} | Origin: ${origin}`);
        console.error(`Error: ${error.message}`);
        if (error.stack) {
          console.error(error.stack);
        }
      })
      .use(cors({
        origin: allowedOrigins,
        credentials: true,
      }))
      .use(openapi({
        mapJsonSchema: {
          zod: z.toJSONSchema
        },
        documentation: {
          info: {
            title: "PopJoy API",
            version: "1.0.0",
            description: "API para o sistema de gerenciamento de eventos da PopJoy.",
          },
          servers: [{
            url: baseURL,
            description: process.env.NODE_ENV === 'production' ? 'Production' : 'Development'
          }],
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
