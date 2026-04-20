import clsx from "clsx";

type Props = { compact?: boolean; className?: string };

export default function Wordmark({ compact, className }: Props) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <svg
        width="22" height="22" viewBox="0 0 22 22"
        fill="none" stroke="currentColor" strokeWidth="1.2"
        aria-hidden="true"
      >
        {/* hex outline */}
        <path d="M11 1 L20.09 6 L20.09 16 L11 21 L1.91 16 L1.91 6 Z" />
        {/* center node */}
        <circle cx="11" cy="11" r="1.4" fill="currentColor" />
        {/* corner nodes */}
        <circle cx="6"  cy="7"  r="1.1" fill="currentColor" />
        <circle cx="16" cy="7"  r="1.1" fill="currentColor" />
        <circle cx="6"  cy="15" r="1.1" fill="currentColor" />
        <circle cx="16" cy="15" r="1.1" fill="currentColor" />
        {/* edges to center */}
        <line x1="6"  y1="7"  x2="11" y2="11" />
        <line x1="16" y1="7"  x2="11" y2="11" />
        <line x1="6"  y1="15" x2="11" y2="11" />
        <line x1="16" y1="15" x2="11" y2="11" />
      </svg>
      {!compact && (
        <span className="font-display tracking-tight text-[1.15rem] leading-none">
          The Nash Lab
        </span>
      )}
    </span>
  );
}
