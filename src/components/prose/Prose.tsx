import type { HTMLAttributes, ReactNode } from "react";

export type ProseProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function Prose({ className, children, ...rest }: ProseProps) {
  const cls = ["t-prose", "p-prose", className].filter(Boolean).join(" ");
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}
