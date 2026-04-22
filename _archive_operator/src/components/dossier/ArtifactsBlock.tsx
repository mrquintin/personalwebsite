type Item = { kind: string; label: string; href: string; glyph?: "ext" | "video" | "mail" };

const GLYPH = { ext: "↗", video: "▶", mail: "✉" } as const;

export default function ArtifactsBlock({ items }: { items: Item[] }) {
  if (!items?.length) return null;
  return (
    <section className="artifacts" aria-label="artifacts">
      <div className="artifacts-h">ARTIFACTS</div>
      <ul>
        {items.map((it, i) => {
          const ext = it.glyph ?? (it.href.startsWith("http") ? "ext" : it.href.startsWith("mailto") ? "mail" : undefined);
          return (
            <li key={i}>
              <span className="k">* {it.kind}</span>
              <span className="l">
                <a href={it.href} target={ext === "ext" ? "_blank" : undefined} rel="noopener">{it.label}</a>
              </span>
              <span aria-hidden="true">{ext ? GLYPH[ext] : ""}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
