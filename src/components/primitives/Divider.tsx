import type { CSSProperties } from "react";

type DividerProps = {
  className?: string;
  style?: CSSProperties;
};

export default function Divider({ className, style }: DividerProps) {
  return (
    <hr
      role="presentation"
      className={className}
      style={{
        border: 0,
        height: "1px",
        backgroundColor: "var(--line)",
        marginBlock: "var(--s-5)",
        ...style,
      }}
    />
  );
}
