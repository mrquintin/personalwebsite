import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface IngestRecord {
  path: string;
  contentHash: string;
  chunkIds: string[];
  ingestedAt: string;
}

interface StateFile {
  version: 1;
  records: Record<string, IngestRecord>;
}

const EMPTY_STATE: StateFile = { version: 1, records: {} };

/**
 * State store for tracking which files have been ingested.
 *
 * Backed by a JSON file on disk for now. When 18/P05 (vector DB)
 * lands, the implementation behind the same interface should move
 * the records into a DB table — callers do not need to change.
 */
export class IngestState {
  private state: StateFile = EMPTY_STATE;
  private loaded = false;

  constructor(private readonly statePath: string) {}

  async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const raw = await readFile(this.statePath, "utf8");
      const parsed = JSON.parse(raw) as StateFile;
      if (parsed && parsed.version === 1 && parsed.records) {
        this.state = parsed;
      } else {
        this.state = { version: 1, records: {} };
      }
    } catch (err) {
      const e = err as NodeJS.ErrnoException;
      if (e.code === "ENOENT") {
        this.state = { version: 1, records: {} };
      } else {
        throw err;
      }
    }
    this.loaded = true;
  }

  isUnchanged(filePath: string, contentHash: string): boolean {
    const rec = this.state.records[filePath];
    return Boolean(rec && rec.contentHash === contentHash);
  }

  get(filePath: string): IngestRecord | undefined {
    return this.state.records[filePath];
  }

  record(rec: IngestRecord): void {
    this.state.records[rec.path] = rec;
  }

  remove(filePath: string): IngestRecord | undefined {
    const prev = this.state.records[filePath];
    delete this.state.records[filePath];
    return prev;
  }

  allRecords(): IngestRecord[] {
    return Object.values(this.state.records);
  }

  clearAll(): IngestRecord[] {
    const prev = Object.values(this.state.records);
    this.state.records = {};
    return prev;
  }

  async save(): Promise<void> {
    await mkdir(path.dirname(this.statePath), { recursive: true });
    await writeFile(
      this.statePath,
      JSON.stringify(this.state, null, 2) + "\n",
      "utf8"
    );
  }
}

export const DEFAULT_STATE_PATH = path.resolve(
  process.cwd(),
  "scripts/llm/.ingest-state.json"
);
