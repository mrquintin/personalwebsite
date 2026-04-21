// Central UI string registry. Components import from here so a single
// diff updates voice across the site.
export const COPY = {
  brand: "Michael Quintin",
  // R04: paletteHint and helpHint kept as exports for any inline page
  // hints that still want them; the bottom status bar that originally
  // displayed them is gone.
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
  // R04: ticker removed with the status bar.
} as const;
