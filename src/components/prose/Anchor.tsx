"use client";

import type { ReactNode } from "react";
import { useCallback } from "react";

export type AnchorProps = {
  id: string;
  children: ReactNode;
};

function buildHref(id: string): string {
  if (typeof window === "undefined") return `#${id}`;
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#${id}`;
}

export default function Anchor({ id, children }: AnchorProps) {
  const onCopy = useCallback(async () => {
    const href = buildHref(id);
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(href);
      } catch {
        /* ignore — clipboard not permitted */
      }
    }
    if (typeof window !== "undefined" && window.history?.replaceState) {
      window.history.replaceState(null, "", `#${id}`);
    }
  }, [id]);

  return (
    <h2 id={id} className="p-anchor">
      <span aria-hidden="true" className="p-anchor__sigil">
        §
      </span>
      <span className="p-anchor__label">{children}</span>
      <button
        type="button"
        aria-label={`Copy link to ${typeof children === "string" ? children : id}`}
        className="p-anchor__copy"
        onClick={onCopy}
      >
        #
      </button>
    </h2>
  );
}
