/**
 * Postgres + pgvector connection.
 *
 * Two connection strings are recognized:
 *   - POSTGRES_URL              — runtime / pooled connection (the app)
 *   - POSTGRES_URL_NON_POOLING  — direct connection used for migrations
 *
 * Vercel Postgres exposes both. For other providers, the same string can
 * be supplied to both env vars.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

import * as schema from "@/db/schema";

export type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

interface ClientHandle {
  sql: Sql;
  db: DrizzleClient;
}

let runtimeHandle: ClientHandle | null = null;
let migrationHandle: ClientHandle | null = null;

function buildClient(connectionString: string, max: number): ClientHandle {
  const sql = postgres(connectionString, {
    max,
    prepare: false,
  });
  const db = drizzle(sql, { schema });
  return { sql, db };
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`${name} is not set`);
  }
  return v;
}

/**
 * Default Drizzle client for runtime use (queries, mutations).
 * Lazily initialized so importing this module never throws when
 * POSTGRES_URL is absent (e.g. during type-checks or local dev with
 * the embedder mocked).
 */
export function getDb(): DrizzleClient {
  if (!runtimeHandle) {
    const url = requireEnv("POSTGRES_URL");
    runtimeHandle = buildClient(url, 10);
  }
  return runtimeHandle.db;
}

export function getSql(): Sql {
  if (!runtimeHandle) {
    const url = requireEnv("POSTGRES_URL");
    runtimeHandle = buildClient(url, 10);
  }
  return runtimeHandle.sql;
}

/**
 * Direct (non-pooled) connection used by migrations. Drizzle's
 * migrator opens its own transactions and benefits from a stable
 * connection without a pooler in front of it.
 */
export function getMigrationDb(): { db: DrizzleClient; sql: Sql } {
  if (!migrationHandle) {
    const url =
      process.env.POSTGRES_URL_NON_POOLING ?? requireEnv("POSTGRES_URL");
    migrationHandle = buildClient(url, 1);
  }
  return migrationHandle;
}

export async function closeConnections(): Promise<void> {
  const handles: ClientHandle[] = [];
  if (runtimeHandle) handles.push(runtimeHandle);
  if (migrationHandle && migrationHandle !== runtimeHandle)
    handles.push(migrationHandle);
  runtimeHandle = null;
  migrationHandle = null;
  await Promise.all(handles.map((h) => h.sql.end({ timeout: 5 })));
}

export { schema };
