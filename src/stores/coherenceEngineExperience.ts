// Coherence Engine experience store. Mounts inside the HVM panel as the
// TECHNICAL face. Five modes: layers, cosine, compare, gates, audit.
import { create } from "zustand";

export type CeMode = "layers" | "cosine" | "compare" | "gates" | "audit";
export type ParadoxStage = "naive" | "empirical" | "difference" | "reflection";
export type DomainKey = "market_economics" | "governance" | "public_health";
export type Regime = "normal" | "defensive" | "stress";
export type ScoringMode = "enforce" | "shadow";
export type ReplayState = "idle" | "running" | "complete" | "mismatch";

export interface LayersSlice {
  activeFixtureId: string;
  selectedLayer: 1 | 2 | 3 | 4 | 5 | null;
  antiGamingEnabled: boolean;
  fusionEnabled: boolean;
  fusionDrawerOpen: boolean;
}

export interface CosineSlice {
  stage: ParadoxStage;
  activePairId: string;
  reflectionAlpha: number;
  reflectionRun: boolean;
  showEntailmentDims: boolean;
}

export interface CompareSlice {
  activePitchId: string;
  showIllustrativeBands: boolean;
  focusDomain: DomainKey | null;
}

export interface GatesSlice {
  activeApplicationId: string;
  stepperIndex: number;
  autoPlay: boolean;
  rDetailExpanded: boolean;
  activeRegime: Regime;
  openDrawerGate: string | null;
}

export interface AuditSlice {
  activeArtifactId: string;
  expandedSections: Record<string, boolean>;
  scoringMode: ScoringMode;
  replayState: ReplayState;
  lastComputedHash: string | null;
  ledgerExpanded: Record<string, boolean>;
}

type State = {
  mode: CeMode;
  layers: LayersSlice;
  cosine: CosineSlice;
  compare: CompareSlice;
  gates: GatesSlice;
  audit: AuditSlice;

  setMode: (m: CeMode) => void;
  openInMode: (target: CeMode, refId: string | null) => void;

  // layers
  setActiveFixture: (id: string) => void;
  setSelectedLayer: (n: LayersSlice["selectedLayer"]) => void;
  toggleAntiGaming: () => void;
  toggleFusion: () => void;
  setFusionDrawerOpen: (open: boolean) => void;

  // cosine
  setStage: (s: ParadoxStage) => void;
  setActivePair: (id: string) => void;
  setReflectionAlpha: (n: number) => void;
  triggerReflectionRun: () => void;
  toggleEntailmentDims: () => void;

  // compare
  setActivePitch: (id: string) => void;
  toggleIllustrativeBands: () => void;
  setFocusDomain: (d: DomainKey | null) => void;

  // gates
  setActiveApplication: (id: string) => void;
  stepForward: () => void;
  stepBackward: () => void;
  resetPipeline: () => void;
  toggleAutoPlay: () => void;
  toggleRDetail: () => void;
  setActiveRegime: (r: Regime) => void;
  openGateDrawer: (gate: string | null) => void;

  // audit
  setActiveArtifact: (id: string) => void;
  toggleSection: (key: string) => void;
  setScoringMode: (m: ScoringMode) => void;
  setReplayState: (rs: ReplayState, hash?: string | null) => void;
  toggleLedgerItem: (id: string) => void;
};

export const useCe = create<State>((set, get) => ({
  mode: "layers",
  layers: {
    activeFixtureId: "a-coherent",
    selectedLayer: null,
    antiGamingEnabled: true,
    fusionEnabled: true,
    fusionDrawerOpen: false,
  },
  cosine: {
    stage: "naive",
    activePairId: "ce-pair-01",
    reflectionAlpha: 2,
    reflectionRun: false,
    showEntailmentDims: false,
  },
  compare: {
    activePitchId: "pitch-coffee",
    showIllustrativeBands: false,
    focusDomain: null,
  },
  gates: {
    activeApplicationId: "app-01-pass",
    stepperIndex: 0,
    autoPlay: false,
    rDetailExpanded: false,
    activeRegime: "normal",
    openDrawerGate: null,
  },
  audit: {
    activeArtifactId: "app-01-pass",
    expandedSections: { input: false, csReq: false },
    scoringMode: "enforce",
    replayState: "idle",
    lastComputedHash: null,
    ledgerExpanded: {
      "predictive-validity": true,
      "weights-tuned": true,
      "cross-domain": true,
    },
  },

  setMode: (m) => set({ mode: m }),
  openInMode: (target, refId) => {
    set({ mode: target });
    const r = refId ?? "";
    if (target === "cosine") {
      if (r.startsWith("stage:")) {
        const s = r.slice("stage:".length) as ParadoxStage;
        set((st) => ({ cosine: { ...st.cosine, stage: s } }));
      } else if (r.startsWith("pair:")) {
        const id = r.slice("pair:".length);
        set((st) => ({ cosine: { ...st.cosine, stage: "difference", activePairId: id } }));
      } else if (r === "axis") {
        set((st) => ({ cosine: { ...st.cosine, stage: "difference" } }));
      }
    } else if (target === "compare") {
      if (r.startsWith("pitch:")) {
        const id = r.slice("pitch:".length);
        set((st) => ({ compare: { ...st.compare, activePitchId: id } }));
      }
    } else if (target === "gates") {
      if (r.startsWith("app:")) set((st) => ({ gates: { ...st.gates, activeApplicationId: r.slice("app:".length), stepperIndex: 0 } }));
      else if (r.startsWith("artifact:")) {
        const id = r.slice("artifact:".length);
        set((st) => ({ gates: { ...st.gates, activeApplicationId: id, stepperIndex: 6 } }));
      } else if (r.startsWith("gate:")) {
        const g = r.slice("gate:".length);
        const order = ["quality_gate", "compliance_gate", "anti_gaming_gate", "portfolio_gate", "coherence_gate", "confidence_gate"];
        const i = order.indexOf(g);
        if (i >= 0) set((st) => ({ gates: { ...st.gates, stepperIndex: i + 1, openDrawerGate: g } }));
      }
    } else if (target === "audit") {
      if (r.startsWith("artifact:")) set((st) => ({ audit: { ...st.audit, activeArtifactId: r.slice("artifact:".length) } }));
      else if (r === "validation-plan") {
        // no-op state, scrolling handled in UI
      } else if (r.startsWith("limit:")) {
        const id = r.slice("limit:".length);
        set((st) => ({ audit: { ...st.audit, ledgerExpanded: { ...st.audit.ledgerExpanded, [id]: true } } }));
      }
    } else if (target === "layers") {
      // no-op or fixture select
      if (r) set((st) => ({ layers: { ...st.layers, activeFixtureId: r } }));
    }
  },

  // layers
  setActiveFixture: (id) => set((s) => ({ layers: { ...s.layers, activeFixtureId: id, selectedLayer: null } })),
  setSelectedLayer: (n) => set((s) => ({ layers: { ...s.layers, selectedLayer: n } })),
  toggleAntiGaming: () => set((s) => ({ layers: { ...s.layers, antiGamingEnabled: !s.layers.antiGamingEnabled } })),
  toggleFusion: () => set((s) => ({ layers: { ...s.layers, fusionEnabled: !s.layers.fusionEnabled } })),
  setFusionDrawerOpen: (open) => set((s) => ({ layers: { ...s.layers, fusionDrawerOpen: open } })),

  // cosine
  setStage: (st) => set((s) => ({ cosine: { ...s.cosine, stage: st, reflectionRun: st === "reflection" ? s.cosine.reflectionRun : false } })),
  setActivePair: (id) => set((s) => ({ cosine: { ...s.cosine, activePairId: id, reflectionRun: false } })),
  setReflectionAlpha: (n) => set((s) => ({ cosine: { ...s.cosine, reflectionAlpha: n, reflectionRun: false } })),
  triggerReflectionRun: () => set((s) => ({ cosine: { ...s.cosine, reflectionRun: true } })),
  toggleEntailmentDims: () => set((s) => ({ cosine: { ...s.cosine, showEntailmentDims: !s.cosine.showEntailmentDims } })),

  // compare
  setActivePitch: (id) => set((s) => ({ compare: { ...s.compare, activePitchId: id, focusDomain: null } })),
  toggleIllustrativeBands: () => set((s) => ({ compare: { ...s.compare, showIllustrativeBands: !s.compare.showIllustrativeBands } })),
  setFocusDomain: (d) => set((s) => ({ compare: { ...s.compare, focusDomain: d } })),

  // gates
  setActiveApplication: (id) => set((s) => ({ gates: { ...s.gates, activeApplicationId: id, stepperIndex: 0, autoPlay: false } })),
  stepForward: () => set((s) => ({ gates: { ...s.gates, stepperIndex: Math.min(6, s.gates.stepperIndex + 1) } })),
  stepBackward: () => set((s) => ({ gates: { ...s.gates, stepperIndex: Math.max(0, s.gates.stepperIndex - 1) } })),
  resetPipeline: () => set((s) => ({ gates: { ...s.gates, stepperIndex: 0, autoPlay: false } })),
  toggleAutoPlay: () => set((s) => ({ gates: { ...s.gates, autoPlay: !s.gates.autoPlay } })),
  toggleRDetail: () => set((s) => ({ gates: { ...s.gates, rDetailExpanded: !s.gates.rDetailExpanded } })),
  setActiveRegime: (r) => set((s) => ({ gates: { ...s.gates, activeRegime: r } })),
  openGateDrawer: (g) => set((s) => ({ gates: { ...s.gates, openDrawerGate: g } })),

  // audit
  setActiveArtifact: (id) => set((s) => ({ audit: { ...s.audit, activeArtifactId: id, replayState: "idle", lastComputedHash: null } })),
  toggleSection: (key) => set((s) => ({ audit: { ...s.audit, expandedSections: { ...s.audit.expandedSections, [key]: !s.audit.expandedSections[key] } } })),
  setScoringMode: (m) => set((s) => ({ audit: { ...s.audit, scoringMode: m, replayState: "idle", lastComputedHash: null } })),
  setReplayState: (rs, hash = null) => set((s) => ({ audit: { ...s.audit, replayState: rs, lastComputedHash: hash ?? s.audit.lastComputedHash } })),
  toggleLedgerItem: (id) => set((s) => ({ audit: { ...s.audit, ledgerExpanded: { ...s.audit.ledgerExpanded, [id]: !s.audit.ledgerExpanded[id] } } })),
}));
