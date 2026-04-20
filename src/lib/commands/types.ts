export type CommandKind = "nav" | "action" | "query";
export type CommandSection = "Navigate" | "Projects" | "Actions" | "External" | "Info";

export type RunContext = {
  router: { push: (href: string) => void };
  toast: (msg: string) => void;
  close: () => void;
};

export type Command = {
  id: string;
  kind: CommandKind;
  title: string;
  subtitle?: string;
  keywords?: string[];
  shortcut?: string[];
  section: CommandSection;
  context?: string;             // path / shortcut / metadata shown right-aligned
  run(ctx: RunContext): void | Promise<void>;
};
