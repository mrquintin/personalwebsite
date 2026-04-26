import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

export const EMBEDDING_DIM = 1024;

export const chunks = pgTable(
  "chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    path: text("path").notNull(),
    contentHash: text("content_hash").notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    text: text("text").notNull(),
    heading: text("heading"),
    section: text("section"),
    topics: text("topics").array(),
    kind: text("kind"),
    date: date("date"),
    citeOkay: boolean("cite_okay").notNull().default(true),
    voiceWeight: real("voice_weight").notNull().default(1.0),
    embedding: vector("embedding", { dimensions: EMBEDDING_DIM }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    pathIdx: index("idx_chunks_path").on(table.path),
    embeddingIdx: index("idx_chunks_embedding")
      .using("hnsw", table.embedding.op("vector_cosine_ops")),
  })
);

export const ingestState = pgTable("ingest_state", {
  path: text("path").primaryKey(),
  contentHash: text("content_hash").notNull(),
  chunkCount: integer("chunk_count").notNull(),
  lastIngested: timestamp("last_ingested", { withTimezone: true }).defaultNow(),
});

export type Chunk = typeof chunks.$inferSelect;
export type NewChunk = typeof chunks.$inferInsert;
export type IngestStateRow = typeof ingestState.$inferSelect;
export type NewIngestStateRow = typeof ingestState.$inferInsert;

export const PGVECTOR_EXTENSION_SQL = sql`CREATE EXTENSION IF NOT EXISTS vector;`;
