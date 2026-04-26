"use client";

import { useCallback, type KeyboardEvent } from "react";
import { microcopy } from "@/content/microcopy";

export function SkipLink() {
  const focusMain = useCallback(() => {
    const el = document.getElementById("main");
    if (el) {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      (el as HTMLElement).focus();
    }
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLAnchorElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        focusMain();
        history.replaceState(null, "", "#main");
      }
    },
    [focusMain],
  );

  return (
    <a href="#main" className="shell-skiplink" onKeyDown={onKeyDown}>
      {microcopy.nav.skipToContent}
    </a>
  );
}

export default SkipLink;
