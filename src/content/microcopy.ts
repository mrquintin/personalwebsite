/* ---------------------------------------------------------------------------
 * microcopy — single source of visitor-facing strings
 *
 * Suite 20/P05. Components import from here so a single diff updates voice
 * across the site. Organized by surface so a translator (or future i18n
 * wrapper) can walk the tree without grepping.
 *
 * Voice rules (see docs/voice-guide.md):
 *   - lowercase friendly mono for buttons ("ask" not "Ask")
 *   - sentence case for prose, headings, aria-labels
 *   - no exclamations outside the "! foo" Unix-error convention
 *   - no forbidden corporate-speak (see src/content/forbidden-words.ts)
 *
 * i18n posture: keys are stable identifiers; values are the English strings.
 * A future translation function can wrap reads (e.g. t(microcopy.buttons.ask))
 * without restructuring callers. Functions here take parameters and return
 * strings so they can be re-implemented in any locale.
 * ------------------------------------------------------------------------- */

export const microcopy = {
  nav: {
    home: "Home",
    projects: "Projects",
    about: "About",
    resume: "Resume",
    chat: "Chat",
    openMenu: "Open navigation",
    closeMenu: "Close navigation",
    skipToContent: "Skip to content",
    primaryLabel: "Primary",
    mobileLabel: "Mobile",
    footerLabel: "Footer",
    drawerLabel: "Navigation",
    identityShort: "michael quintin",
  },

  buttons: {
    ask: "ask",
    retry: "retry",
    clear: "clear",
    copy: "copy",
    copied: "copied",
    stop: "stop",
    prev: "prev",
    next: "next",
    submit: "submit",
    reload: "reload",
    download: "Download PDF",
    print: "Print",
    copyToClipboard: "Copy to clipboard",
    jumpToBottom: "↓ jump to bottom",
    rowOpen: "↵ open",
    rowOpenTab: "⌘↵ tab",
  },

  errors: {
    rateLimited: (minutes: number): string =>
      `You've hit the per-hour limit (resets in ${minutes} minute${
        minutes === 1 ? "" : "s"
      }). Try again then.`,
    serverError:
      "The LLM service is unreachable right now. Try again in a moment.",
    networkLost: "Connection lost. Check your network and retry.",
    validation:
      "Hmm, the request didn't validate. Try shortening your question.",
    requestFailed: (status: number): string => `request failed (${status})`,
    boundaryTitle: "Something went wrong.",
    boundaryDetail: (message?: string): string =>
      `The chat surface hit an unexpected error and stopped rendering.${
        message ? ` (${message})` : ""
      }`,
    empty: "no answer was returned. try again.",
    failedPrefix: "failed",
    unknown: "unknown error",
    notFound: "404. no file at this path. ⌘K to navigate.",
    runtime: (m: string): string =>
      `! process crashed. error: ${m}. ⌘K to navigate.`,
    clipboardDenied: "! clipboard permission denied",
  },

  emptyStates: {
    noResults: "no commands matched. / to filter.",
    noConversation: "no messages yet — ask anything below.",
    noProjects: "no projects matched filter. / to edit.",
    teaserTag: "[ in progress · no page yet ]",
  },

  confirms: {
    clearChat: "clear this conversation? cannot be undone.",
  },

  placeholders: {
    chatInput: "Ask anything about my work or thinking…",
    paletteSearch: "command or search — ESC to close",
    projectsFilter: "filter — esc to clear",
  },

  meta: {
    phaseCounter: (n: number, total: number): string =>
      `phase ${n} of ${total}`,
    paletteFooter:
      "↑↓ navigate   ↵ run   ⌘↵ run in new tab   /  filter   ?  help",
    paletteHint: "⌘K palette",
    helpHint: "F1 help",
    sessionInit: "session initialized · ⌘K to search",
    sessionResumed: "session resumed",
    classification: {
      public: "UNCLASSIFIED",
      restricted: "CONTROLLED UNCLASSIFIED",
      private: "CONFIDENTIAL · DO NOT REDISTRIBUTE",
    },
    youLabel: "you",
    assistantLabel: "the LLM",
    chatHeading: "Ask my LLM about my work",
    chatSubhead:
      "A retrieval-augmented assistant grounded in my essays, project notes, and public writing. It cites the corpus, answers in my voice, and admits when it doesn't know — it isn't me, and shouldn't pretend to be.",
    chatGroundingLink: "What's grounding this →",
    persistLabel: "Save this conversation locally",
    persistNote: "Saved locally on your device. Never sent to the server.",
    chatInputAriaLabel: "Your question",
    chatInputFormLabel: "Chat input",
    chatLogAriaLabel: "Conversation",
    chatRegionLabel: "Chat with the LLM",
    paletteTitle: "Command palette",
    paletteDescription: "Type a command or fuzzy-search the site.",
    paletteResultsLabel: (n: number): string => `${n} results`,
    paletteEscKbd: "ESC",
    paletteChevron: "›",
    konamiToast: "you have good taste. welcome.",
    sudoToast:
      "operator.michael.quintin ALL=(ALL) ALL — permission granted",
    noContextNote:
      "(no relevant material was retrieved from the corpus; this answer is in the speaker's voice but not grounded in specific writings.)",
    copyrightLine: "© 2026 Michael Quintin",
    brand: "Michael Quintin",
    referencesNote: "Available on request.",
    projectsHeaderPrefix: ">> projects",
    projectsActionsCol: "actions",
    themeAriaLabel: (choice: string): string => `Theme: ${choice}`,
    rowSelectedPreviewLabel: "selected project preview",
    toastCopied: "✓ copied",
    toastDownloadStarted: "· download started",
    copyMessageAriaLabel: "copy message",
  },
} as const;

export type Microcopy = typeof microcopy;

/* ---------------------------------------------------------------------------
 * Legacy compatibility shim
 *
 * `COPY` is the prior shape. It is preserved (sourced from `microcopy`)
 * because src/_legacy_v1 still imports it; per the prompt, that tree is a
 * non-goal. New code MUST import `microcopy` directly.
 * ------------------------------------------------------------------------- */
export const COPY = {
  brand: microcopy.meta.brand,
  paletteHint: microcopy.meta.paletteHint,
  helpHint: microcopy.meta.helpHint,
  paletteOpen: microcopy.placeholders.paletteSearch,
  paletteFooter: microcopy.meta.paletteFooter,
  sessionInit: microcopy.meta.sessionInit,
  sessionResumed: microcopy.meta.sessionResumed,
  classification: microcopy.meta.classification,
  errors: {
    notFound: microcopy.errors.notFound,
    runtime: microcopy.errors.runtime,
    clipboardDenied: microcopy.errors.clipboardDenied,
  },
  toast: {
    copied: microcopy.meta.toastCopied,
    downloadStarted: microcopy.meta.toastDownloadStarted,
  },
  resume: {
    download: microcopy.buttons.download,
    print: microcopy.buttons.print,
    copy: microcopy.buttons.copyToClipboard,
    references: microcopy.meta.referencesNote,
  },
  projects: {
    headerPrefix: microcopy.meta.projectsHeaderPrefix,
    emptyFilter: microcopy.emptyStates.noProjects,
    rowOpen: microcopy.buttons.rowOpen,
    rowOpenTab: microcopy.buttons.rowOpenTab,
  },
} as const;
