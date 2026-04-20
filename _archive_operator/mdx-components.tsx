import type { MDXComponents } from "mdx/types";

// Default MDX -> HTML mapping. The book page composes its own components for
// drop caps; everywhere else, MDX renders into the dossier prose style.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (p) => <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", margin: "var(--s-5) 0 var(--s-3)" }} {...p} />,
    h2: (p) => <h3 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", margin: "var(--s-5) 0 var(--s-3)" }} {...p} />,
    p:  (p) => <p style={{ marginTop: "var(--s-4)" }} {...p} />,
    a:  (p) => <a style={{ color: "var(--accent)" }} {...p} />,
    blockquote: (p) => <blockquote style={{ borderLeft: "2px solid var(--rule)", paddingLeft: "var(--s-4)", color: "var(--fg-dim)", margin: "var(--s-4) 0" }} {...p} />,
    code: (p) => <code style={{ fontFamily: "var(--font-mono)", background: "var(--bg-2)", padding: "1px 4px" }} {...p} />,
    ...components,
  };
}
