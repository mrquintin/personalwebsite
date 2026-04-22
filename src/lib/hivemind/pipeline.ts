// P04 — Knowledge Pipeline. 7 stages × 3 sample doc archetypes.
// TODO(michael): verify config constants against current src/cloud config.
import type { Mode } from "./failures";

export interface PipelineStageEntry {
  id: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  name: string;
  oneLiner: string;
  sourceFilePath: string;
  phase: "ingest" | "query";
  inputLabel: string;
  outputLabel: string;
  theOneDecision: string;
  configConstants?: Array<{ key: string; value: string }>;
  crossRef?: { mode: Mode; refId: string; hint: string };
}

export interface StageSample {
  input: string | Array<string | number>;
  output: string | Array<string | number>;
}

export interface SamplePipelineDoc {
  id: "porter" | "eu-mdr" | "quarterly-ledger";
  filename: string;
  sizeLabel: string;
  documentType: "framework" | "practicality" | "simulation_description";
  stageSamples: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, StageSample>;
  embeddingPointIds: string[];
}

export interface EmbeddingCloudPoint {
  id: string;
  x: number; y: number;          // precomputed 2D coords (0..100)
  docType: "framework" | "practicality" | "simulation_description";
  label: string;
  chunkIndex: number;
  chunkText: string;
}

export const PIPELINE_STAGES: PipelineStageEntry[] = [
  { id: 1, name: "UPLOAD", phase: "ingest",
    oneLiner: "File ingest with explicit document-type dispatch.",
    sourceFilePath: "cloud/app/routers/knowledge_bases.py",
    inputLabel: "a file (pdf, docx, html, txt). Max 50MB.",
    outputLabel: "raw bytes + document_type.",
    theOneDecision:
      "The endpoint sets document_type, not the LLM. /upload → 'framework'; /upload-practicality → 'practicality'; /upload-simulation → 'simulation_description'; /upload-smart auto-classifies via LLM. document_type is the filter that scopes retrieval — a Porter-framework slice should not retrieve regulatory chunks; the endpoint dispatch makes that filter cheap.",
  },
  { id: 2, name: "TEXT EXTRACTION", phase: "ingest",
    oneLiner: "Format-specific extractors.",
    sourceFilePath: "cloud/app/rag/extraction.py",
    inputLabel: "raw bytes + format.",
    outputLabel: "raw text string.",
    theOneDecision:
      "PDF → PyMuPDF; DOCX → python-docx; HTML → tag-strip; TXT → UTF-8 with errors=ignore. A single extractor like Apache Tika would be simpler but slower and less predictable. Format-specific means failure modes are specific.",
  },
  { id: 3, name: "LLM OPTIMIZATION", phase: "ingest",
    oneLiner: "Best-effort cleanup; non-gating.",
    sourceFilePath: "cloud/app/services/document_optimizer.py",
    inputLabel: "raw text + document_type.",
    outputLabel: "optimized text (or raw, on fallback).",
    theOneDecision:
      "Send to Claude Sonnet with a document-type-specific prompt to clean for RAG. >40,000 characters: skip (too expensive and timeout-prone). API key missing or call fails: fall back to raw text and index anyway. Optimization is best-effort, not gating — the document gets indexed either way.",
    configConstants: [
      { key: "DOCUMENT_OPT_SKIP_CHARS", value: "40000" },
      { key: "DOCUMENT_OPT_MODEL",      value: "claude-sonnet" },
    ],
  },
  { id: 4, name: "CHUNKING", phase: "ingest",
    oneLiner: "Token-bounded chunks with overlap.",
    sourceFilePath: "cloud/app/rag/chunking.py",
    inputLabel: "optimized (or raw) text.",
    outputLabel: "list of token-bounded text chunks with overlap.",
    theOneDecision:
      "Split on paragraph boundaries; accumulate until reaching RAG_CHUNK_MAX_TOKENS (default 800); save; carry over the last RAG_CHUNK_OVERLAP tokens (default 80) into the next chunk. Token counting via tiktoken with cl100k_base. Documents below RAG_CHUNK_MIN_TOKENS (500) still produce exactly one chunk. 800 tokens is about one page of dense text — the minimum unit at which a theoretical claim has its own context.",
    configConstants: [
      { key: "RAG_CHUNK_MAX_TOKENS", value: "800" },
      { key: "RAG_CHUNK_OVERLAP",    value: "80" },
      { key: "RAG_CHUNK_MIN_TOKENS", value: "500" },
    ],
    crossRef: { mode: "knobs", refId: "density",
      hint: "density sets the target per-agent slice size; packing respects these chunks." },
  },
  { id: 5, name: "EMBEDDING", phase: "ingest",
    oneLiner: "Local MiniLM, 384-dim, batched 64.",
    sourceFilePath: "cloud/app/rag/embeddings.py",
    inputLabel: "list of chunk strings.",
    outputLabel: "list of 384-dim float32 vectors.",
    theOneDecision:
      "all-MiniLM-L6-v2: 22M parameters, 384-dim output. Chosen for two reasons that travel together: no per-query cost (≈40 embedding calls per analysis); works offline (Admin app runs local Postgres, Qdrant, API on one machine). Trade-off: slightly lower retrieval quality than text-embedding-3-small. Acceptable for curated KBs.",
    configConstants: [
      { key: "EMBEDDING_MODEL",     value: "all-MiniLM-L6-v2" },
      { key: "EMBEDDING_DIM",       value: "384" },
      { key: "EMBEDDING_BATCH_SIZE", value: "64" },
      { key: "EMBEDDING_NORM",       value: "L2 (cosine = dot product)" },
    ],
  },
  { id: 6, name: "VECTOR UPSERT", phase: "ingest",
    oneLiner: "Qdrant HNSW; Postgres mirror for bookkeeping.",
    sourceFilePath: "cloud/app/rag/vector_store.py",
    inputLabel: "(vector, payload) tuples.",
    outputLabel: "indexed points in kb_{knowledge_base_id} collection.",
    theOneDecision:
      "Qdrant over pgvector: HNSW indexing; better ANN at scale; Docker alongside the app; open source; clean Python client. Pinecone rejected for cloud dependency and per-query cost. Chunks are also stored in PostgreSQL (text_chunks table) for bookkeeping; if Qdrant is corrupted, chunks can be re-embedded from Postgres.",
    configConstants: [
      { key: "QDRANT_DISTANCE", value: "cosine" },
      { key: "QDRANT_INDEX",    value: "HNSW" },
      { key: "MIRROR_TABLE",    value: "text_chunks (postgres)" },
    ],
    crossRef: { mode: "failures", refId: "analysis",
      hint: "this is where the peer-reviewed KB actually lives." },
  },
  { id: 7, name: "RETRIEVAL", phase: "query",
    oneLiner: "Embed query, search Qdrant, filter, top-K.",
    sourceFilePath: "cloud/app/rag/retrieval.py",
    inputLabel: "query string + agent's knowledge_base_ids.",
    outputLabel: "top-K excerpts formatted for the agent's prompt.",
    theOneDecision:
      "Embed the query with the same MiniLM model; search Qdrant for each KB the agent is bound to; filter by similarity threshold (default 0.0), document_ids, document_types; sort by score descending; return top K (default 8). When filtering by document_types, retrieval over-fetches 5× from Qdrant and filters in Python (document-type filtering is post-query).",
    configConstants: [
      { key: "DEFAULT_TOP_K",      value: "8" },
      { key: "OVER_FETCH_FACTOR",  value: "5" },
      { key: "SIM_THRESHOLD",      value: "0.0 (display-only)" },
    ],
    crossRef: { mode: "theater", refId: "e1",
      hint: "this is what the theory agent saw before proposing." },
  },
];

const PORTER_FILE = "porters-five-forces.pdf";
const MDR_FILE    = "eu-mdr-2017-745.pdf";
const LEDGER_FILE = "quarterly-ledger-q4-2024.csv";

export const SAMPLE_DOCS: SamplePipelineDoc[] = [
  {
    id: "porter", filename: PORTER_FILE, sizeLabel: "2.3MB", documentType: "framework",
    embeddingPointIds: ["p1", "p2", "p3", "p4", "p5"],
    stageSamples: {
      1: { input: PORTER_FILE, output: "raw_bytes + document_type='framework'" },
      2: { input: "raw_bytes (pdf)", output: "23,408 chars: 'The five forces framework identifies five competitive forces...'" },
      3: { input: "23,408 chars", output: "16,210 chars (filler removed; restructured for RAG)" },
      4: { input: "16,210 chars", output: ["chunk[0] (788 tok)", "chunk[1] (792 tok)", "chunk[2] (804 tok, +80 overlap)", "chunk[3] (412 tok, tail)"] },
      5: { input: "4 chunks", output: [0.071, -0.044, 0.182, 0.011, -0.156, 0.094, 0.038, "…(384 dims)"] },
      6: { input: "4 (vector, payload) tuples", output: "kb_strategy_001: 4 points upserted; collection cosine-distance" },
      7: { input: "query: 'how should a regional grocer respond to a discount entrant?'", output: "[EXCERPT 1] porters-five-forces.pdf (p. 7)\nThe five forces framework identifies five competitive…" },
    },
  },
  {
    id: "eu-mdr", filename: MDR_FILE, sizeLabel: "8.1MB", documentType: "practicality",
    embeddingPointIds: ["m1", "m2", "m3", "m4"],
    stageSamples: {
      1: { input: MDR_FILE, output: "raw_bytes + document_type='practicality'" },
      2: { input: "raw_bytes (pdf)", output: "412,008 chars (long regulation): 'Regulation (EU) 2017/745 of the European Parliament...'" },
      3: { input: "412,008 chars (>40k)", output: "SKIPPED — fall back to raw text and index anyway." },
      4: { input: "412,008 chars", output: ["chunk[0]…chunk[523] (each ~800 tok)"] },
      5: { input: "524 chunks", output: [-0.018, 0.211, 0.044, "…(384 dims × 524 vectors)"] },
      6: { input: "524 vectors", output: "kb_compliance_eu: 524 points upserted" },
      7: { input: "query: 'CE marking obligations for Class IIa devices'", output: "[EXCERPT 1] eu-mdr-2017-745.pdf (p. 124)\nClass IIa devices require conformity assessment under Annex IX…" },
    },
  },
  {
    id: "quarterly-ledger", filename: LEDGER_FILE, sizeLabel: "780KB", documentType: "simulation_description",
    embeddingPointIds: ["l1", "l2"],
    stageSamples: {
      1: { input: LEDGER_FILE, output: "raw_bytes + document_type='simulation_description'" },
      2: { input: "raw_bytes (csv)", output: "8,212 chars (extracted as text; tabular preserved)" },
      3: { input: "8,212 chars", output: "5,440 chars (structured ledger summary; not narrative cleanup)" },
      4: { input: "5,440 chars", output: ["chunk[0] (612 tok, single chunk because <800)"] },
      5: { input: "1 chunk", output: [0.122, -0.087, 0.011, "…(384 dims)"] },
      6: { input: "1 vector", output: "kb_client_simulations: 1 point upserted" },
      7: { input: "query: 'recent gross-margin trend in the regional grocer simulation'", output: "[EXCERPT 1] quarterly-ledger-q4-2024.csv\nQ4-2024 gross margin: 24.1% (down 80bps QoQ)…" },
    },
  },
];

// Precomputed t-SNE-style cloud (~30 points). Coords are static.
export const EMBEDDING_CLOUD_POINTS: EmbeddingCloudPoint[] = [
  // framework cluster (top-left)
  { id: "p1", x: 22, y: 18, docType: "framework", label: "five forces overview",  chunkIndex: 0, chunkText: "The five forces framework identifies five competitive forces…" },
  { id: "p2", x: 28, y: 22, docType: "framework", label: "buyer power",            chunkIndex: 1, chunkText: "Buyer power increases when products are commoditized…" },
  { id: "p3", x: 18, y: 25, docType: "framework", label: "rivalry",                chunkIndex: 2, chunkText: "Rivalry intensity tracks fixed-cost intensity and exit barriers…" },
  { id: "p4", x: 25, y: 30, docType: "framework", label: "entrants",               chunkIndex: 3, chunkText: "New entrants face capital, brand, and channel barriers…" },
  { id: "p5", x: 32, y: 28, docType: "framework", label: "substitutes",            chunkIndex: 4, chunkText: "Substitutes set a ceiling on industry pricing…" },
  { id: "p6", x: 16, y: 16, docType: "framework", label: "porter analytics",       chunkIndex: 5, chunkText: "Quantitative scoring of each force with 1–5 scale…" },
  { id: "p7", x: 30, y: 14, docType: "framework", label: "case method intro",      chunkIndex: 6, chunkText: "Worked example: regional retail under category disruption…" },
  { id: "p8", x: 35, y: 22, docType: "framework", label: "value chain link",       chunkIndex: 7, chunkText: "The five forces sit upstream of value-chain configuration…" },
  { id: "p9", x: 22, y: 35, docType: "framework", label: "limits of frame",        chunkIndex: 8, chunkText: "Critique: five forces underweights ecosystem dynamics…" },

  // practicality cluster (right)
  { id: "m1", x: 72, y: 30, docType: "practicality", label: "EU MDR scope",        chunkIndex: 0, chunkText: "Regulation (EU) 2017/745 covers medical devices and accessories…" },
  { id: "m2", x: 78, y: 26, docType: "practicality", label: "Class IIa",           chunkIndex: 124, chunkText: "Class IIa devices require conformity assessment under Annex IX…" },
  { id: "m3", x: 75, y: 38, docType: "practicality", label: "post-market",         chunkIndex: 248, chunkText: "Post-market surveillance plan obligations…" },
  { id: "m4", x: 82, y: 34, docType: "practicality", label: "UDI",                 chunkIndex: 312, chunkText: "Unique Device Identification system requirements…" },
  { id: "m5", x: 70, y: 42, docType: "practicality", label: "notified bodies",     chunkIndex: 410, chunkText: "Designation and oversight of notified bodies…" },
  { id: "m6", x: 80, y: 44, docType: "practicality", label: "transitional",        chunkIndex: 488, chunkText: "Transitional provisions for legacy CE-marked devices…" },
  { id: "m7", x: 85, y: 28, docType: "practicality", label: "vigilance",           chunkIndex: 502, chunkText: "Vigilance reporting timelines and severity thresholds…" },
  { id: "m8", x: 76, y: 50, docType: "practicality", label: "language",            chunkIndex: 520, chunkText: "Member-state language requirements for IFU…" },

  // simulation cluster (bottom)
  { id: "l1", x: 48, y: 72, docType: "simulation_description", label: "Q4 ledger",  chunkIndex: 0, chunkText: "Q4-2024 gross margin: 24.1% (down 80bps QoQ)…" },
  { id: "l2", x: 54, y: 76, docType: "simulation_description", label: "by region",  chunkIndex: 1, chunkText: "Regional breakdown: Mid-Atlantic 27%, Carolinas 22%, Southeast 19%…" },

  // border / mixed
  { id: "p10", x: 42, y: 40, docType: "framework",     label: "scenario tree",     chunkIndex: 9, chunkText: "Scenario branching with explicit prior probabilities…" },
  { id: "m9",  x: 60, y: 45, docType: "practicality",  label: "audit trail req",   chunkIndex: 533, chunkText: "Manufacturer must maintain technical documentation for 10 years…" },
  { id: "p11", x: 38, y: 48, docType: "framework",     label: "competitor map",    chunkIndex: 10, chunkText: "Mapping competitor moves on a payoff lattice…" },
  { id: "m10", x: 65, y: 52, docType: "practicality",  label: "labelling",         chunkIndex: 540, chunkText: "Labelling requirements per Annex I…" },
  { id: "l3",  x: 50, y: 60, docType: "simulation_description", label: "headcount", chunkIndex: 2, chunkText: "Headcount: 18,400 (+1.2% YoY); store density 1.4/zip…" },
  { id: "p12", x: 28, y: 50, docType: "framework",     label: "rivalry depth",     chunkIndex: 11, chunkText: "Rivalry escalation tactics and credible commitments…" },
  { id: "p13", x: 14, y: 38, docType: "framework",     label: "moat dimensions",   chunkIndex: 12, chunkText: "Moats classified by switching cost, network effect, scale…" },
  { id: "m11", x: 82, y: 48, docType: "practicality",  label: "EUDAMED",           chunkIndex: 555, chunkText: "EUDAMED database submission obligations…" },
  { id: "p14", x: 36, y: 62, docType: "framework",     label: "low-end disrupt",   chunkIndex: 13, chunkText: "Low-end disruption: targeting non-consumers first…" },
];
