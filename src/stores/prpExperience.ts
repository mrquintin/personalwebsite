// Single zustand store for the PRP experience. Spans all five modes
// (P01 Ontology · P02 Quadrant · P03 Diamond · P04 Objections · P05 Atlas).
import { create } from "zustand";
import type { Quadrant, Placement } from "@/lib/prp/quadrantCases";

export type Mode = "ontology" | "quadrant" | "diamond" | "objections" | "atlas";

export type DiamondWalk = {
  caseId: string;
  step1Choice: number | null;
  step2Verdict: "DISSOLVE" | "DECLARE" | null;
  step2Justification: string;
  step3Reconstruction: string;
  step4Consequences: [string, string, string];
  accepted: boolean;
  dissented: boolean;
  completedAt: number | null;
};

type State = {
  // chassis
  mode: Mode;
  selectedClaimId: string | null;

  // P02 Quadrant
  quadrant: {
    placements: Record<string, Placement>;
    revealed: Set<string>;
    interviewMode: boolean;
    activeCaseId: string | null;
  };

  // P03 Diamond
  diamond: {
    activeCaseId: string | null;
    activeStep: 0 | 1 | 2 | 3 | 4;
    currentWalk: DiamondWalk | null;
    history: Record<string, DiamondWalk[]>;
  };

  // P04 Objections
  objections: {
    openId: string | null;
    tile: "A" | "B" | "C" | null;
    readIds: Set<string>;
    continuationChoice: Record<string, { index: number | "custom"; text?: string }>;
    rankedIds: string[] | null;
  };

  // P05 Atlas
  atlas: {
    focusThinkerId: string | null;
    glossaryOpen: boolean;
    glossaryFullOpen: boolean;
    glossarySearch: string;
  };

  // chassis actions
  setMode: (m: Mode) => void;
  setSelectedClaimId: (id: string | null) => void;

  // P02
  placeCase: (id: string, p: Placement) => void;
  revealCase: (id: string) => void;
  toggleInterview: () => void;
  startInterview: (id: string) => void;
  cancelInterview: () => void;
  completeInterview: (tally: { purpose: number; efficiency: number }) => void;

  // P03
  pickCase: (id: string) => void;
  setStepInput: (step: 1 | 2 | 3 | 4, input: unknown) => void;
  stepBack: () => void;
  stepNext: () => void;
  submitWalk: () => void;
  acceptWalk: () => void;
  dissentWalk: () => void;
  redoWalk: () => void;

  // P04
  openObjection: (id: string) => void;
  advanceTile: () => void;
  chooseContinuation: (index: number | "custom", text?: string) => void;
  closeTurn: () => void;
  rankObjections: (ids: string[]) => void;

  // P05
  openThinker: (id: string) => void;
  closeThinker: () => void;
  toggleGlossary: () => void;
  openFullGlossary: (search?: string) => void;
  closeFullGlossary: () => void;
};

const emptyWalk = (caseId: string): DiamondWalk => ({
  caseId,
  step1Choice: null,
  step2Verdict: null,
  step2Justification: "",
  step3Reconstruction: "",
  step4Consequences: ["", "", ""],
  accepted: false,
  dissented: false,
  completedAt: null,
});

export const usePrp = create<State>((set, get) => ({
  mode: "ontology",
  selectedClaimId: null,

  quadrant: { placements: {}, revealed: new Set(), interviewMode: false, activeCaseId: null },
  diamond:  { activeCaseId: null, activeStep: 0, currentWalk: null, history: {} },
  objections: { openId: null, tile: null, readIds: new Set(), continuationChoice: {}, rankedIds: null },
  atlas: { focusThinkerId: null, glossaryOpen: true, glossaryFullOpen: false, glossarySearch: "" },

  setMode: (m) => set({ mode: m }),
  setSelectedClaimId: (id) => set({ selectedClaimId: id }),

  placeCase: (id, p) => set((s) => ({
    quadrant: { ...s.quadrant, placements: { ...s.quadrant.placements, [id]: p } },
  })),
  revealCase: (id) => set((s) => ({
    quadrant: { ...s.quadrant, revealed: new Set(s.quadrant.revealed).add(id) },
  })),
  toggleInterview: () => set((s) => ({
    quadrant: { ...s.quadrant, interviewMode: !s.quadrant.interviewMode },
  })),
  startInterview: (id) => set((s) => ({
    quadrant: { ...s.quadrant, activeCaseId: id },
  })),
  cancelInterview: () => set((s) => ({
    quadrant: { ...s.quadrant, activeCaseId: null },
  })),
  completeInterview: () => set((s) => ({
    quadrant: { ...s.quadrant, activeCaseId: null },
  })),

  pickCase: (id) => set((s) => ({
    diamond: { ...s.diamond, activeCaseId: id, activeStep: 1, currentWalk: emptyWalk(id) },
  })),
  setStepInput: (step, input) => set((s) => {
    if (!s.diamond.currentWalk) return s;
    const w = { ...s.diamond.currentWalk };
    if (step === 1) w.step1Choice = input as number;
    if (step === 2) {
      const i = input as { verdict: "DISSOLVE" | "DECLARE"; justification: string };
      w.step2Verdict = i.verdict;
      w.step2Justification = i.justification;
    }
    if (step === 3) w.step3Reconstruction = input as string;
    if (step === 4) w.step4Consequences = input as [string, string, string];
    return { diamond: { ...s.diamond, currentWalk: w } };
  }),
  stepBack: () => set((s) => ({
    diamond: { ...s.diamond, activeStep: Math.max(1, s.diamond.activeStep - 1) as 0 | 1 | 2 | 3 | 4 },
  })),
  stepNext: () => set((s) => ({
    diamond: { ...s.diamond, activeStep: Math.min(4, s.diamond.activeStep + 1) as 0 | 1 | 2 | 3 | 4 },
  })),
  submitWalk: () => set((s) => {
    if (!s.diamond.currentWalk || !s.diamond.activeCaseId) return s;
    const w = { ...s.diamond.currentWalk, completedAt: Date.now() };
    const history = { ...s.diamond.history };
    history[s.diamond.activeCaseId] = [...(history[s.diamond.activeCaseId] ?? []), w];
    return { diamond: { ...s.diamond, currentWalk: w, history } };
  }),
  acceptWalk: () => set((s) => {
    if (!s.diamond.currentWalk) return s;
    return { diamond: { ...s.diamond, currentWalk: { ...s.diamond.currentWalk, accepted: true } } };
  }),
  dissentWalk: () => set((s) => {
    if (!s.diamond.currentWalk) return s;
    return { diamond: { ...s.diamond, currentWalk: { ...s.diamond.currentWalk, dissented: true } } };
  }),
  redoWalk: () => {
    const id = get().diamond.activeCaseId;
    if (!id) return;
    set((s) => ({ diamond: { ...s.diamond, currentWalk: emptyWalk(id), activeStep: 1 } }));
  },

  openObjection: (id) => set((s) => ({
    objections: { ...s.objections, openId: id, tile: "A", readIds: new Set(s.objections.readIds).add(id) },
  })),
  advanceTile: () => set((s) => {
    const next: Record<"A" | "B" | "C", "A" | "B" | "C" | null> = { A: "B", B: "C", C: null };
    return { objections: { ...s.objections, tile: s.objections.tile ? next[s.objections.tile] : null } };
  }),
  chooseContinuation: (index, text) => set((s) => {
    if (!s.objections.openId) return s;
    return {
      objections: {
        ...s.objections,
        continuationChoice: {
          ...s.objections.continuationChoice,
          [s.objections.openId]: { index, text },
        },
      },
    };
  }),
  closeTurn: () => set((s) => ({
    objections: { ...s.objections, openId: null, tile: null },
  })),
  rankObjections: (ids) => set((s) => ({ objections: { ...s.objections, rankedIds: ids } })),

  openThinker: (id) => set((s) => ({ atlas: { ...s.atlas, focusThinkerId: id } })),
  closeThinker: () => set((s) => ({ atlas: { ...s.atlas, focusThinkerId: null } })),
  toggleGlossary: () => set((s) => ({ atlas: { ...s.atlas, glossaryOpen: !s.atlas.glossaryOpen } })),
  openFullGlossary: (search) => set((s) => ({
    atlas: { ...s.atlas, glossaryFullOpen: true, glossarySearch: search ?? "" },
  })),
  closeFullGlossary: () => set((s) => ({ atlas: { ...s.atlas, glossaryFullOpen: false } })),
}));

// Quadrant utility — given a placement and the book's placement, the agreement category.
export function agreementOf(user: Placement, book: Placement): "SAME" | "ADJACENT" | "OPPOSITE" {
  if (user.quadrant === book.quadrant) return "SAME";
  // Opposite pairs: Q1<->Q4, Q2<->Q3.
  const opp: Record<Quadrant, Quadrant> = { Q1: "Q4", Q4: "Q1", Q2: "Q3", Q3: "Q2" };
  if (opp[user.quadrant] === book.quadrant) return "OPPOSITE";
  return "ADJACENT";
}
