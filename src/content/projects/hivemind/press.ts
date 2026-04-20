// TODO(michael): supply real press / artifact links
export type Artifact = { kind: string; label: string; href: string; glyph?: "ext" | "video" | "mail" };

const press: Artifact[] = [
  { kind: "website",       label: "hivemind.ai",                   href: "https://hivemind.ai",      glyph: "ext" },
  { kind: "product login", label: "app.hivemind.ai",               href: "https://app.hivemind.ai",  glyph: "ext" },
  { kind: "demo",          label: "(walkthrough — pending)",       href: "#",                         glyph: "video" },
  { kind: "github",        label: "(pending)",                     href: "#",                         glyph: "ext" },
  { kind: "press",         label: "(pending)",                     href: "#",                         glyph: "ext" },
  { kind: "contact",       label: "michael@hivemind.ai",           href: "mailto:michael@hivemind.ai", glyph: "mail" },
];
export default press;
