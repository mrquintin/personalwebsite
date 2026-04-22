// P05 — Audit Artifact. Derived from the default theater run, with
// schema fields the theater does not surface (retrievedContext,
// tWallClockIso, parentEventId, payloadHash).
import { THEATER_RUNS, DEFAULT_THEATER_RUN_ID, type TranscriptEvent } from "./theaterScript";

export type AuditEventType = TranscriptEvent["type"];

export interface RetrievedExcerpt {
  chunkId: string;
  documentName: string;
  sourcePage: number;
  textExcerpt: string;
}

export interface AuditEvent {
  id: string;
  runId: string;
  round: string;
  type: AuditEventType;
  speakerId: string;
  targetSpeakerId?: string;
  bodyText: string;
  retrievedContext: RetrievedExcerpt[];
  tVirtualSec: number;
  tWallClockIso: string;
  parentEventId?: string;
  payloadHash: string;
}

export interface AuditRun {
  id: string;
  clientTag: string;
  startedAtIso: string;
  sufficiencyValue: number;
  feasibilityValue: number;
  densityLabel: string;
  totalEvents: number;
  durationSec: number;
  verdict: "PASSED" | "VETOED";
  events: AuditEvent[];
}

export interface AuditHeader {
  format: "JSON Lines (.jsonl)";
  schemaVersion: "hivemind-audit-v1";
  ownership: "client";
}

export interface AuditFilterState {
  eventTypes: Set<AuditEventType>;
  round: string | "all";
  agentId: string | "all";
  substring: string;
}

export const AUDIT_HEADER: AuditHeader = {
  format: "JSON Lines (.jsonl)",
  schemaVersion: "hivemind-audit-v1",
  ownership: "client",
};

const STARTED_AT = "2026-03-14T09:12:00Z";

// Authored retrieved-context library — agents share excerpts when they
// retrieve the same chunks. Monitor events have empty arrays.
const PORTER_CONTEXT: RetrievedExcerpt[] = [
  { chunkId: "p1", documentName: "porters-five-forces.pdf", sourcePage: 7,
    textExcerpt: "The five forces framework identifies five competitive forces that shape industry attractiveness…" },
  { chunkId: "p3", documentName: "porters-five-forces.pdf", sourcePage: 14,
    textExcerpt: "Rivalry intensity tracks fixed-cost intensity and exit barriers; price wars erupt when both are high…" },
];
const NASH_CONTEXT: RetrievedExcerpt[] = [
  { chunkId: "n1", documentName: "nash-equilibrium-game-theory.pdf", sourcePage: 22,
    textExcerpt: "An equilibrium is a profile in which no player can improve by unilateral deviation…" },
  { chunkId: "n2", documentName: "thinking-strategically.pdf", sourcePage: 88,
    textExcerpt: "When the opponent's payoff matrix is known, dominated strategies should be eliminated iteratively…" },
];
const CHRISTENSEN_CONTEXT: RetrievedExcerpt[] = [
  { chunkId: "c1", documentName: "innovators-dilemma.pdf", sourcePage: 31,
    textExcerpt: "Disruptive innovations target non-consumers first; sustaining innovations serve existing customers better…" },
];
const DRUCKER_CONTEXT: RetrievedExcerpt[] = [
  { chunkId: "d1", documentName: "managing-for-results.pdf", sourcePage: 12,
    textExcerpt: "Specify outcomes; assign accountable owners; reduce strategy to a small number of measurable steps…" },
];
const KAHNEMAN_CONTEXT: RetrievedExcerpt[] = [
  { chunkId: "k1", documentName: "thinking-fast-and-slow.pdf", sourcePage: 218,
    textExcerpt: "Loss aversion: losses loom larger than gains by approximately a 2:1 ratio in most settings…" },
];
const PRACTICALITY_LEGAL: RetrievedExcerpt[] = [
  { chunkId: "m9", documentName: "us-antitrust-overview.pdf", sourcePage: 4,
    textExcerpt: "Hart-Scott-Rodino notification thresholds for proposed transactions…" },
];
const PRACTICALITY_FIN: RetrievedExcerpt[] = [
  { chunkId: "f1", documentName: "regional-grocer-financials-anonymized.pdf", sourcePage: 12,
    textExcerpt: "Quarterly free cash flow over the trailing four quarters: $42M, $38M, $44M, $41M…" },
];

const CONTEXT_BY_AGENT: Record<string, RetrievedExcerpt[]> = {
  porter: PORTER_CONTEXT, nash: NASH_CONTEXT, christensen: CHRISTENSEN_CONTEXT,
  drucker: DRUCKER_CONTEXT, kahneman: KAHNEMAN_CONTEXT,
};
const CONTEXT_BY_CONSTRAINT: Record<string, RetrievedExcerpt[]> = {
  LEGAL: PRACTICALITY_LEGAL, REGULATORY: PRACTICALITY_LEGAL,
  FINANCIAL: PRACTICALITY_FIN, OPERATIONAL: PRACTICALITY_FIN, REPUTATIONAL: [],
};

function pseudoHash(id: string): string {
  // Stable, plausible-looking hex placeholder. NOT a real hash.
  let acc = 0;
  for (let i = 0; i < id.length; i++) acc = ((acc << 5) - acc + id.charCodeAt(i)) | 0;
  const hex = (acc >>> 0).toString(16).padStart(8, "0");
  return `sha256:${hex}${hex}…${hex.slice(0, 4)}`;
}

function roundLabel(r: number): string {
  if (r === -1) return "R-practice";
  if (r === 0) return "R0";
  return `R${r}`;
}

function deriveAuditEvents(): AuditEvent[] {
  const theater = THEATER_RUNS.find((r) => r.id === DEFAULT_THEATER_RUN_ID)!;
  const out: AuditEvent[] = [];
  let lastByAgent: Record<string, string> = {};

  for (const e of theater.events) {
    const speakerId = e.speakerId ?? "monitor";
    let context: RetrievedExcerpt[] = [];
    if (e.type === "proposal" || e.type === "critique" || e.type === "revision") {
      context = CONTEXT_BY_AGENT[speakerId] ?? [];
    } else if (e.type === "practicality_score") {
      // Pull constraint from the body's "X on Cluster Y:" pattern
      const m = e.body.match(/^([A-Z]+)/);
      if (m) context = CONTEXT_BY_CONSTRAINT[m[1]] ?? [];
    }
    let parent: string | undefined;
    if (e.type === "critique" || e.type === "revision") {
      // Prefer the most recent event by the targeted agent (or by self for revision)
      parent = lastByAgent[e.targetSpeakerId ?? speakerId];
    }
    out.push({
      id: e.id,
      runId: `run-${theater.id}`,
      round: roundLabel(e.round),
      type: e.type,
      speakerId,
      targetSpeakerId: e.targetSpeakerId,
      bodyText: e.body,
      retrievedContext: context,
      tVirtualSec: e.tSec,
      tWallClockIso: new Date(new Date(STARTED_AT).getTime() + e.tSec * 1000).toISOString(),
      parentEventId: parent,
      payloadHash: pseudoHash(e.id + speakerId),
    });
    if (e.type === "proposal" || e.type === "revision") lastByAgent[speakerId] = e.id;
  }
  return out;
}

const AUDIT_EVENTS = deriveAuditEvents();

export const AUDIT_RUN: AuditRun = (() => {
  const theater = THEATER_RUNS.find((r) => r.id === DEFAULT_THEATER_RUN_ID)!;
  return {
    id: `run-${theater.id}`,
    clientTag: "client-id: redacted-demo",
    startedAtIso: STARTED_AT,
    sufficiencyValue: theater.sufficiencyValue,
    feasibilityValue: theater.feasibilityValue,
    densityLabel: theater.densityLabel,
    totalEvents: AUDIT_EVENTS.length,
    durationSec: theater.durationSec,
    verdict: theater.verdict,
    events: AUDIT_EVENTS,
  };
})();

// Sample JSONL excerpt — first ~10 events with bodies trimmed.
export const AUDIT_SAMPLE_JSONL: string[] = AUDIT_RUN.events.slice(0, 10).map((e) => JSON.stringify({
  id: e.id, runId: e.runId, round: e.round, type: e.type,
  speakerId: e.speakerId,
  ...(e.targetSpeakerId ? { targetSpeakerId: e.targetSpeakerId } : {}),
  bodyText: e.bodyText.length > 80 ? e.bodyText.slice(0, 77) + "…" : e.bodyText,
  retrievedContext: e.retrievedContext.map((c) => c.chunkId),
  tVirtualSec: e.tVirtualSec,
  tWallClockIso: e.tWallClockIso,
  ...(e.parentEventId ? { parentEventId: e.parentEventId } : {}),
  payloadHash: e.payloadHash,
}));

// Verbatim — appears EXACTLY once across all HVM fixtures (P06 §B1 audit).
export const FIDUCIARY_DISCLAIMER =
  "The Nash Lab disclaims responsibility for conclusions drawn by the client. The audit trail is owned by the client. The firm does not read it.";

export const EXPORT_PREVIEW_CAPTION =
  "This preview shows the file format and schema of the audit trail. The actual file is written to the client's infrastructure during deliberation, not produced by this panel.";

export const EXPORT_DISABLED_TOOLTIP =
  "Export is a client-side feature of the Hivemind desktop application. This panel cannot export a real audit trail because there is no deliberation running here.";
