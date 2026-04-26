CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TABLE "chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"content_hash" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"text" text NOT NULL,
	"heading" text,
	"section" text,
	"topics" text[],
	"kind" text,
	"date" date,
	"cite_okay" boolean DEFAULT true NOT NULL,
	"voice_weight" real DEFAULT 1 NOT NULL,
	"embedding" vector(1024) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ingest_state" (
	"path" text PRIMARY KEY NOT NULL,
	"content_hash" text NOT NULL,
	"chunk_count" integer NOT NULL,
	"last_ingested" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_chunks_path" ON "chunks" USING btree ("path");--> statement-breakpoint
CREATE INDEX "idx_chunks_embedding" ON "chunks" USING hnsw ("embedding" vector_cosine_ops);