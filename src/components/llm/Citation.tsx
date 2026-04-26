/* ---------------------------------------------------------------------------
 * Citation — suite 19/P02
 * Footer strip rendered beneath an assistant message. Lists each cited
 * corpus chunk with id, source label, and (when resolvable) a link out to
 * the public-facing page.
 * --------------------------------------------------------------------------- */

import Link from "@/components/primitives/Link";

export type CitationItem = {
  id: string;
  chunkId: string;
  snippet: string;
  path: string;
  heading?: string;
  kind?: string;
  date?: string;
};

/**
 * Resolve a chunkId / path to a public-facing URL when possible.
 * Returns null when the source is not exposed on the public site
 * (e.g. private notes, drafts) — in which case the citation strip
 * shows metadata only and omits the "open source" affordance.
 */
export function hrefForChunk(
  chunkId: string,
  path?: string,
): string | null {
  const p = (path ?? chunkId).replace(/^\/+/, "");

  const project = p.match(/^corpus\/projects\/([^/]+)\//);
  if (project) {
    return `/projects/${project[1]}`;
  }

  if (/^corpus\/about\//.test(p)) return "/about";
  if (/^corpus\/resume\//.test(p)) return "/resume";

  return null;
}

function filenameFor(item: CitationItem): string {
  if (item.heading && item.heading.trim()) return item.heading;
  const parts = item.path.split("/");
  const tail = parts[parts.length - 1] ?? item.path;
  return tail.replace(/\.[^.]+$/, "");
}

function metaFor(item: CitationItem): string | null {
  const bits: string[] = [];
  if (item.kind) bits.push(item.kind);
  if (item.date) bits.push(item.date);
  return bits.length > 0 ? bits.join(" · ") : null;
}

type CitationStripProps = {
  items: CitationItem[];
};

export function CitationStrip({ items }: CitationStripProps) {
  if (!items || items.length === 0) return null;

  return (
    <footer className="msg-citations" aria-label="Sources">
      <ol className="msg-citations__list">
        {items.map((item) => {
          const href = hrefForChunk(item.chunkId, item.path);
          const label = filenameFor(item);
          const meta = metaFor(item);
          return (
            <li
              key={item.id}
              id={`cite-${item.id}`}
              className="msg-citations__item"
            >
              <span className="msg-citations__marker">[{item.id}]</span>{" "}
              <span className="msg-citations__label">&ldquo;{label}&rdquo;</span>
              {meta ? (
                <>
                  {" "}
                  <span className="msg-citations__meta">{meta}</span>
                </>
              ) : null}
              {href ? (
                <>
                  {" "}
                  <Link
                    href={href}
                    variant="subtle"
                    className="msg-citations__link"
                  >
                    open source ↗
                  </Link>
                </>
              ) : null}
            </li>
          );
        })}
      </ol>
    </footer>
  );
}

export default CitationStrip;
