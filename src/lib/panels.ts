// Canonical list of the five (optional six) panels. Single source of truth.
export type PanelDef = {
  id: string;          // "01" .. "05"
  code: string;        // "ABT" .. "CV"
  title: string;
  href: string;
  index: number;       // 1..5
  flushBody?: boolean; // I01: project panels host an ExperienceHost; no padding
};

export const PANELS: PanelDef[] = [
  { id: "01", code: "ABT", title: "About",                   href: "/about",                   index: 1 },
  { id: "02", code: "HVM", title: "Hivemind",                href: "/hivemind",                index: 2, flushBody: true },
  { id: "03", code: "PRP", title: "Purposeless Efficiency",  href: "/purposeless-efficiency",  index: 3, flushBody: true },
  { id: "04", code: "THS", title: "Theseus",                 href: "/theseus",                 index: 4, flushBody: true },
  { id: "05", code: "CV",  title: "Resume",                  href: "/resume",                  index: 5 },
];

// Optional 6th panel revealed only on very wide displays (>=1680px).
export const PANEL_LOG: PanelDef = {
  id: "06", code: "LOG", title: "Changelog", href: "/changelog", index: 6,
};

export function getPanelByCode(code: string): PanelDef | undefined {
  return PANELS.find((p) => p.code === code.toUpperCase());
}
export function getPanelByHref(href: string): PanelDef | undefined {
  return PANELS.find((p) => href.startsWith(p.href));
}
