import type { ReactNode } from "react";
import Surface from "../primitives/Surface";

export type AsideTone = "note" | "warn" | "voice";

export type AsideProps = {
  tone?: AsideTone;
  children: ReactNode;
  className?: string;
};

const TONE_LABEL: Record<AsideTone, string> = {
  note: "NOTE",
  warn: "WARN",
  voice: "VOICE",
};

export default function Aside({
  tone = "note",
  className,
  children,
}: AsideProps) {
  const cls = ["p-aside", `p-aside--${tone}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Surface tone="mute" border padding={5} className={cls} role="note">
      <div className="p-aside__label" data-tone={tone}>
        {TONE_LABEL[tone]}
      </div>
      <div className="p-aside__body">{children}</div>
    </Surface>
  );
}
