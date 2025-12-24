#!/usr/bin/env bun

/**
 * Script para dropar todas as tabelas do banco de dados
 * Uso: bun run scripts/drop-all-tables.ts
 */

import { Client } from "pg";
import { env } from "../src/env";

async function dropAllTables() {
  const client = new Client({
    connectionString: env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("✅ Conectado ao banco de dados");

    // Dropar todas as tabelas em ordem (respeitando foreign keys)
    const tables = [
      "event_units",
      "popcorn_units",
      "batches",
      "product_variants",
      "products",
      "events",
      "user_addresses",
      "user_contacts",
      "passkeys",
      "accounts",
      "sessions",
      "verifications",
      "users",
    ];

    console.log("\n🗑️  Dropping tables...");
    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
        console.log(`   ✓ Dropped table: ${table}`);
      } catch (error: any) {
        console.log(`   ⚠️  Error dropping ${table}: ${error.message}`);
      }
    }

    console.log("\n✅ Todas as tabelas foram removidas!");
    console.log("\n📝 Próximos passos:");
    console.log("   1. Execute: bun run db:migrate");
    console.log("   2. Ou regenere as migrations: bun run db:generate && bun run db:migrate");
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

dropAllTables();

