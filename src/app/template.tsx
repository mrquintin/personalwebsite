/* ---------------------------------------------------------------------------
 * template.tsx — suite 14/P06
 * Per-route Next.js template. Remounts on route change so the page-in
 * fade replays. Server component; zero JS shipped. CSS-only animation.
 * --------------------------------------------------------------------------- */

import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
