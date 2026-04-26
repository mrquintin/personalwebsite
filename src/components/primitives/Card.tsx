import type { ReactNode } from "react";
import Link from "./Link";
import Surface from "./Surface";

export type CardProps = {
  href?: string;
  title: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
  titleAs?: "h2" | "h3" | "h4";
};

export default function Card({ href, title, meta, children, className, titleAs = "h3" }: CardProps) {
  const isLink = Boolean(href);
  const cls = ["p-card", isLink ? "p-card--link" : null, className]
    .filter(Boolean)
    .join(" ");
  const TitleTag = titleAs;

  const inner = (
    <Surface tone="raise" padding={5} border={false} className={cls}>
      <header className="p-card__head">
        <TitleTag className="p-card__title">{title}</TitleTag>
        {meta ? <span className="p-card__meta">{meta}</span> : null}
      </header>
      {children ? <div className="p-card__body">{children}</div> : null}
    </Surface>
  );

  if (isLink && href) {
    return (
      <Link href={href} variant="subtle" className="p-card__link">
        {inner}
      </Link>
    );
  }
  return inner;
}
