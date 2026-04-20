import { COPY } from "@/content/microcopy";
import type { Classification } from "@/lib/dossier/types";

export default function ClassificationBanner({ value }: { value: Classification }) {
  return (
    <span style={{ color: "var(--fg-mute)", fontFamily: "var(--font-mono)", fontSize: "var(--t-xs-size)" }}>
      {COPY.classification[value]}
    </span>
  );
}
