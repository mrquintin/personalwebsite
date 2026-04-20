// TODO(michael): convert this raw legacy ontology dataset into the
// Principle schema at ./principles.ts (id, text, supports[], tensions[]).
// The shapes differ — categories/sizes here, supports/tensions there.
//
// Original source: public/js/ontology-data.js (legacy site).
// Preserved here so the principle data is not lost during the public/_legacy
// archival in Prompt 14.
/* eslint-disable */
// @ts-nocheck

/* ============================================================
   ontology-data.js — Your Conceptual Ontology
   ============================================================

   HOW TO EDIT:

   1. NODES — Each node is one idea/concept. Add as many as you want.
      {
        id:          "unique-id",           // must be unique, lowercase-kebab-case
        label:       "Display Name",        // what shows on the graph
        category:    "philosophy",           // groups for color-coding (see CATEGORIES below)
        description: "A short explanation",  // shown when you click a node
        size:        "md",                   // "sm", "md", "lg", "xl" — controls node size
        links:       ["other-id", "etc"]     // IDs of connected concepts (edges auto-generate)
      }

   2. CATEGORIES — Define your domains. Each gets a unique color.
      { id: "tech", label: "Technology", color: "#4fc3f7" }

   3. Connections are BIDIRECTIONAL — if A links to B, you only need
      to list it once (in either A's links or B's links, not both).

   ============================================================ */

const ONTOLOGY_CATEGORIES = [
  { id: "philosophy",  label: "Philosophy",       color: "#b39ddb" },  // soft purple
  { id: "tech",        label: "Technology",        color: "#4fc3f7" },  // sky blue
  { id: "creative",    label: "Creative",          color: "#f48fb1" },  // soft pink
  { id: "science",     label: "Science",           color: "#81c784" },  // green
  { id: "systems",     label: "Systems Thinking",  color: "#ffb74d" },  // amber
  { id: "social",      label: "Social / Cultural", color: "#e0e0e0" },  // neutral gray
];

const ONTOLOGY_NODES = [
  // ─── Core Ideas ──────────────────────────────────────────
  {
    id: "emergence",
    label: "Emergence",
    category: "philosophy",
    description: "Complex systems produce behaviors and properties that their individual components don't possess. The whole is more than the sum of its parts.",
    size: "xl",
    links: ["complexity", "consciousness", "self-organization", "collective-intelligence"]
  },
  {
    id: "complexity",
    label: "Complexity Theory",
    category: "systems",
    description: "The study of systems with many interacting components whose aggregate behavior is difficult to predict from the components alone.",
    size: "lg",
    links: ["networks", "feedback-loops", "chaos"]
  },
  {
    id: "consciousness",
    label: "Consciousness",
    category: "philosophy",
    description: "The subjective experience of awareness. What is it, where does it come from, and can it be replicated?",
    size: "lg",
    links: ["qualia", "ai-alignment", "embodiment"]
  },

  // ─── Technology ──────────────────────────────────────────
  {
    id: "ai-alignment",
    label: "AI Alignment",
    category: "tech",
    description: "Ensuring artificial intelligence systems act in ways that are beneficial and aligned with human values.",
    size: "lg",
    links: ["ethics", "collective-intelligence", "feedback-loops"]
  },
  {
    id: "networks",
    label: "Network Theory",
    category: "tech",
    description: "The study of graphs as representations of relations between discrete objects — from social networks to neural architectures.",
    size: "md",
    links: ["collective-intelligence", "information-theory"]
  },
  {
    id: "information-theory",
    label: "Information Theory",
    category: "science",
    description: "The mathematical study of quantifying, storing, and communicating information. Shannon entropy, compression, signal and noise.",
    size: "md",
    links: ["complexity", "language"]
  },

  // ─── Creative / Cultural ─────────────────────────────────
  {
    id: "language",
    label: "Language & Meaning",
    category: "creative",
    description: "How symbols, words, and structures carry and create meaning. The relationship between language and thought.",
    size: "md",
    links: ["narrative", "consciousness", "semiotics"]
  },
  {
    id: "narrative",
    label: "Narrative Structure",
    category: "creative",
    description: "How stories are constructed, why they resonate, and how narrative shapes our understanding of reality.",
    size: "md",
    links: ["collective-intelligence", "identity"]
  },
  {
    id: "semiotics",
    label: "Semiotics",
    category: "creative",
    description: "The study of signs and symbols as elements of communicative behavior — how meaning is produced and interpreted.",
    size: "sm",
    links: ["language"]
  },

  // ─── Systems ─────────────────────────────────────────────
  {
    id: "self-organization",
    label: "Self-Organization",
    category: "systems",
    description: "The spontaneous creation of order out of disorder through local interactions without central control.",
    size: "md",
    links: ["feedback-loops", "complexity"]
  },
  {
    id: "feedback-loops",
    label: "Feedback Loops",
    category: "systems",
    description: "Circular causal processes where outputs of a system are routed back as inputs, creating amplification or stabilization.",
    size: "md",
    links: ["self-organization"]
  },
  {
    id: "chaos",
    label: "Chaos & Nonlinearity",
    category: "science",
    description: "Deterministic systems that exhibit unpredictable behavior. Small changes in initial conditions lead to vastly different outcomes.",
    size: "sm",
    links: ["complexity", "self-organization"]
  },

  // ─── Philosophy ──────────────────────────────────────────
  {
    id: "qualia",
    label: "Qualia",
    category: "philosophy",
    description: "The individual instances of subjective, conscious experience — the 'what it is like' of perception.",
    size: "sm",
    links: ["embodiment"]
  },
  {
    id: "embodiment",
    label: "Embodied Cognition",
    category: "philosophy",
    description: "The theory that many features of cognition are shaped by aspects of the body beyond the brain.",
    size: "md",
    links: ["consciousness"]
  },
  {
    id: "ethics",
    label: "Ethics of Technology",
    category: "philosophy",
    description: "The moral questions raised by technological development — responsibility, agency, power, and unintended consequences.",
    size: "md",
    links: ["ai-alignment", "collective-intelligence"]
  },

  // ─── Social ──────────────────────────────────────────────
  {
    id: "collective-intelligence",
    label: "Collective Intelligence",
    category: "social",
    description: "Intelligence that emerges from collaboration, competition, and coordination among groups of individuals.",
    size: "lg",
    links: ["networks", "self-organization"]
  },
  {
    id: "identity",
    label: "Identity & Self",
    category: "social",
    description: "The construction and experience of selfhood — how identity is formed, performed, and transformed.",
    size: "md",
    links: ["narrative", "consciousness", "language"]
  },
];

export { ONTOLOGY_CATEGORIES, ONTOLOGY_NODES };
