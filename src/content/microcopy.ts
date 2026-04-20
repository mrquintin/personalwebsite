// Central UI string registry. Components import from here so a single
// diff updates voice across the site.
export const COPY = {
  brand: "Michael Quintin",
  paletteHint: "⌘K palette",
  helpHint: "F1 help",
  paletteOpen: "command or search — ESC to close",
  paletteFooter: "↑↓ navigate   ↵ run   ⌘↵ run in new tab   /  filter   ?  help",
  sessionInit: "session initialized · ⌘K to search",
  sessionResumed: "session resumed",
  classification: {
    public: "UNCLASSIFIED",
    restricted: "CONTROLLED UNCLASSIFIED",
    private: "CONFIDENTIAL · DO NOT REDISTRIBUTE",
  },
  errors: {
    notFound: "404. no file at this path. ⌘K to navigate.",
    runtime: (m: string) => `! process crashed. error: ${m}. ⌘K to navigate.`,
    clipboardDenied: "! clipboard permission denied",
  },
  toast: {
    copied: "✓ copied",
    downloadStarted: "· download started",
  },
  resume: {
    download: "Download PDF",
    print: "Print",
    copy: "Copy to clipboard",
    references: "Available on request.",
  },
  projects: {
    headerPrefix: ">> projects",
    emptyFilter: "no projects matched filter. / to edit.",
    rowOpen: "↵ open",
    rowOpenTab: "⌘↵ tab",
  },
  ticker: [
    "STATUS: idle · awaiting input",
    "STATUS: 3 projects loaded · 0 anomalies",
    "STATUS: theseus noosphere · last scan recent",
    "STATUS: ⌘K to query",
    "STATUS: ~/resume.pdf · last updated recently",
  ],
} as const;
