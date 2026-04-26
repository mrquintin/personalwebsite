#!/usr/bin/env tsx
/**
 * Run pending Drizzle migrations against the configured Postgres.
 *
 *   POSTGRES_URL_NON_POOLING=postgres://... npm run db:migrate
 *
 * Falls back to POSTGRES_URL if the non-pooling URL is not set. Exits
 * non-zero if neither is available.
 */
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { getMigrationDb, closeConnections } from "../../src/lib/llm/db.js";

async function main(): Promise<number> {
  if (!process.env.POSTGRES_URL && !process.env.POSTGRES_URL_NON_POOLING) {
    console.error(
      "[migrate] neither POSTGRES_URL nor POSTGRES_URL_NON_POOLING is set"
    );
    return 1;
  }
  const { db, sql } = getMigrationDb();

  console.log("[migrate] ensuring pgvector extension is available");
  await sql.unsafe("CREATE EXTENSION IF NOT EXISTS vector;");

  console.log("[migrate] running migrations from src/db/migrations");
  await migrate(db, { migrationsFolder: "./src/db/migrations" });

  console.log("[migrate] done");
  return 0;
}

main()
  .then(async (code) => {
    await closeConnections();
    process.exit(code);
  })
  .catch(async (err) => {
    console.error(err);
    await closeConnections();
    process.exit(1);
  });
