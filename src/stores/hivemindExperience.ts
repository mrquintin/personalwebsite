// Hivemind suite store: spans the five modes (Theater, Knobs, Failures,
// Pipeline, Audit). Each slice mirrors what its mode component needs.
import { create } from "zustand";
import {
  DEFAULT_THEATER_RUN_ID, findRun, type TheaterRun,
} from "@/lib/hivemind/theaterScript";
import {
  DEFAULT_TUPLE, lookupOutcome, runIdForTuple, type KnobTuple, type KnobOutcome,
} from "@/lib/hivemind/knobMatrix";
import type { AuditEventType, AuditFilterState } from "@/lib/hivemind/auditScript";
import type { FailureEntry } from "@/lib/hivemind/failures";

export type Mode = "theater" | "knobs" | "failures" | "pipeline" | "audit";

type Speed = 1 | 2 | 4;

export type TheaterState = {
  activeRunId: string;
  cursor: number;
  state: "idle" | "playing" | "paused" | "ended";
  speed: Speed;
  sufficiencyValue: number;
  feasibilityValue: number;
  filterAgentId: string | null;
  followTail: boolean;
};

export type KnobsState = {
  current: KnobTuple;
  previous: KnobTuple | null;
};

export type FailuresState = {
  expandedFailureId: FailureEntry["id"] | null;
  principlesOpen: boolean;
  initialBelief: 1 | 2 | 3 | 4 | 5 | 6 | 7 | null;
};

export type PipelineState = {
  activeStageId: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  activeSampleId: "porter" | "eu-mdr" | "quarterly-ledger";
  activePointId: string;
};

export type AuditState = {
  selectedEventId: string;
  filters: AuditFilterState;
  contextOpen: boolean;
  exportOpen: boolean;
};

type State = {
  mode: Mode;
  theater: TheaterState;
  knobs: KnobsState;
  failures: FailuresState;
  pipeline: PipelineState;
  audit: AuditState;

  // chassis
  setMode: (m: Mode) => void;
  openInMode: (target: Mode, refId: string) => void;

  // theater
  selectRun: (runId: string) => void;
  play: () => void;
  pause: () => void;
  setSpeed: (s: Speed) => void;
  stepForward: () => void;
  stepBack: () => void;
  jumpToEvent: (id: string) => void;
  jumpToStart: () => void;
  jumpToEnd: () => void;
  setFilter: (agentId: string | null) => void;
  setSufficiency: (v: number) => void;
  setFeasibility: (v: number) => void;
  setFollowTail: (b: boolean) => void;

  // knobs
  setKnob: (k: keyof KnobTuple, v: number) => void;
  resetKnobs: () => void;
  currentOutcome: () => KnobOutcome;

  // failures
  toggleFailure: (id: FailureEntry["id"]) => void;
  openPrinciples: (belief: 1 | 2 | 3 | 4 | 5 | 6 | 7 | null) => void;
  closePrinciples: () => void;

  // pipeline
  activatePipelineStage: (id: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  setPipelineSample: (id: "porter" | "eu-mdr" | "quarterly-ledger") => void;
  setPipelinePoint: (id: string) => void;

  // audit
  selectAuditEvent: (id: string) => void;
  setAuditFilters: (next: AuditFilterState) => void;
  toggleAuditContext: () => void;
  toggleAuditExport: () => void;
};

const initialFilters: AuditFilterState = {
  eventTypes: new Set<AuditEventType>(),
  round: "all",
  agentId: "all",
  substring: "",
};

export const useHvm = create<State>((set, get) => ({
  mode: "theater",
  theater: {
    activeRunId: DEFAULT_THEATER_RUN_ID,
    cursor: 0,
    state: "idle",
    speed: 1,
    sufficiencyValue: 3,
    feasibilityValue: 55,
    filterAgentId: null,
    followTail: true,
  },
  knobs: { current: DEFAULT_TUPLE, previous: null },
  failures: { expandedFailureId: null, principlesOpen: false, initialBelief: null },
  pipeline: { activeStageId: 1, activeSampleId: "porter", activePointId: "p1" },
  audit: { selectedEventId: "e1", filters: initialFilters, contextOpen: false, exportOpen: true },

  setMode: (m) => set({ mode: m }),
  openInMode: (target, refId) => {
    set({ mode: target });
    if (target === "theater") {
      // refId is an event id; jump to it
      get().jumpToEvent(refId);
    } else if (target === "knobs") {
      // refId could be a knob name or a tuple — for now treat as no-op selector hint
    } else if (target === "failures") {
      if (refId.startsWith("belief-")) {
        const n = parseInt(refId.slice("belief-".length), 10);
        if (n >= 1 && n <= 7) set({ failures: { ...get().failures, principlesOpen: true, initialBelief: n as 1|2|3|4|5|6|7 } });
      } else if (refId === "executive") {
        // no-op
      } else if (["hiring","analysis","accountability","theatrics"].includes(refId)) {
        set({ failures: { ...get().failures, expandedFailureId: refId as FailureEntry["id"] } });
      }
    } else if (target === "pipeline") {
      const n = parseInt(refId, 10);
      if (n >= 1 && n <= 7) set({ pipeline: { ...get().pipeline, activeStageId: n as 1|2|3|4|5|6|7 } });
      else if (refId === "embedding-cloud") set({ pipeline: { ...get().pipeline, activeStageId: 5 } });
      else if (["porter","eu-mdr","quarterly-ledger"].includes(refId)) set({ pipeline: { ...get().pipeline, activeSampleId: refId as PipelineState["activeSampleId"] } });
    } else if (target === "audit") {
      if (refId === "export") set({ audit: { ...get().audit, exportOpen: true } });
      else set({ audit: { ...get().audit, selectedEventId: refId } });
    }
  },

  selectRun: (runId) => {
    const t = get().theater;
    const r = findRun(parseSuff(runId), parseFeas(runId));
    set({ theater: { ...t, activeRunId: r.id, cursor: 0, state: "idle",
                      sufficiencyValue: r.sufficiencyValue, feasibilityValue: r.feasibilityValue } });
  },
  play: () => set((s) => ({ theater: { ...s.theater, state: "playing" } })),
  pause: () => set((s) => ({ theater: { ...s.theater, state: "paused" } })),
  setSpeed: (sp) => set((s) => ({ theater: { ...s.theater, speed: sp } })),
  stepForward: () => set((s) => {
    const r = findRun(s.theater.sufficiencyValue, s.theater.feasibilityValue);
    const next = Math.min(r.events.length - 1, s.theater.cursor + 1);
    return { theater: { ...s.theater, cursor: next, state: next === r.events.length - 1 ? "ended" : s.theater.state } };
  }),
  stepBack: () => set((s) => ({ theater: { ...s.theater, cursor: Math.max(0, s.theater.cursor - 1), state: "paused" } })),
  jumpToEvent: (id) => set((s) => {
    const r = findRun(s.theater.sufficiencyValue, s.theater.feasibilityValue);
    const i = r.events.findIndex((e) => e.id === id);
    if (i < 0) return s;
    return { theater: { ...s.theater, cursor: i, state: "paused" } };
  }),
  jumpToStart: () => set((s) => ({ theater: { ...s.theater, cursor: 0, state: "idle" } })),
  jumpToEnd: () => set((s) => {
    const r = findRun(s.theater.sufficiencyValue, s.theater.feasibilityValue);
    return { theater: { ...s.theater, cursor: r.events.length - 1, state: "ended" } };
  }),
  setFilter: (agentId) => set((s) => ({ theater: { ...s.theater, filterAgentId: agentId } })),
  setSufficiency: (v) => set((s) => {
    if (s.theater.state === "playing") return s;
    const r = findRun(v, s.theater.feasibilityValue);
    return { theater: { ...s.theater, sufficiencyValue: v, activeRunId: r.id, cursor: 0, state: "idle" } };
  }),
  setFeasibility: (v) => set((s) => {
    if (s.theater.state === "playing") return s;
    const r = findRun(s.theater.sufficiencyValue, v);
    return { theater: { ...s.theater, feasibilityValue: v, activeRunId: r.id, cursor: 0, state: "idle" } };
  }),
  setFollowTail: (b) => set((s) => ({ theater: { ...s.theater, followTail: b } })),

  setKnob: (k, v) => set((s) => ({ knobs: { previous: s.knobs.current, current: { ...s.knobs.current, [k]: v } as KnobTuple } })),
  resetKnobs: () => set((s) => ({ knobs: { previous: s.knobs.current, current: DEFAULT_TUPLE } })),
  currentOutcome: () => lookupOutcome(get().knobs.current),

  toggleFailure: (id) => set((s) => ({ failures: { ...s.failures, expandedFailureId: s.failures.expandedFailureId === id ? null : id } })),
  openPrinciples: (b) => set((s) => ({ failures: { ...s.failures, principlesOpen: true, initialBelief: b } })),
  closePrinciples: () => set((s) => ({ failures: { ...s.failures, principlesOpen: false, initialBelief: null } })),

  activatePipelineStage: (id) => set((s) => ({ pipeline: { ...s.pipeline, activeStageId: id } })),
  setPipelineSample: (id) => set((s) => ({ pipeline: { ...s.pipeline, activeSampleId: id } })),
  setPipelinePoint: (id) => set((s) => ({ pipeline: { ...s.pipeline, activePointId: id } })),

  selectAuditEvent: (id) => set((s) => ({ audit: { ...s.audit, selectedEventId: id } })),
  setAuditFilters: (next) => set((s) => ({ audit: { ...s.audit, filters: next } })),
  toggleAuditContext: () => set((s) => ({ audit: { ...s.audit, contextOpen: !s.audit.contextOpen } })),
  toggleAuditExport: () => set((s) => ({ audit: { ...s.audit, exportOpen: !s.audit.exportOpen } })),
}));

function parseSuff(id: string): number {
  const m = id.match(/^suff(\d)/);
  return m ? parseInt(m[1], 10) : 3;
}
function parseFeas(id: string): number {
  const m = id.match(/feas(\d+)/);
  return m ? parseInt(m[1], 10) : 55;
}

export { runIdForTuple };
export function currentTheaterRun(): TheaterRun {
  const s = useHvm.getState().theater;
  return findRun(s.sufficiencyValue, s.feasibilityValue);
}
