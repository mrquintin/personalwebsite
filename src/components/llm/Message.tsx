/* ---------------------------------------------------------------------------
 * Message — suite 19/P02 (+ 19/P05 copy control)
 * Renders a single chat message. User messages stay mono and terse;
 * assistant messages render markdown + an inline citations strip and
 * expose a small "copy" button that writes plain text (no markdown
 * markers, no [cN] citation markers) to the clipboard.
 * --------------------------------------------------------------------------- */

"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import Button from "@/components/primitives/Button";
import { renderMarkdown } from "@/lib/llm/markdownRenderer";
import { CitationStrip, type CitationItem } from "./Citation";
import { microcopy } from "@/content/microcopy";

type MessageRole = "user" | "assistant";

export const NO_CONTEXT_NOTE = microcopy.meta.noContextNote;

export type MessageProps = {
  role: MessageRole;
  content: string;
  citations?: CitationItem[];
  noContext?: boolean;
};

function Markdown({ children }: { children: string }) {
  return <div className="md">{renderMarkdown(children)}</div>;
}

/**
 * Strip the small markdown subset we render plus inline citation markers
 * so the clipboard receives readable prose, not raw source. Mirrors the
 * subset documented in markdownRenderer.ts.
 */
export function toPlainText(src: string): string {
  let out = src.replace(/\r\n/g, "\n");
  // fenced code blocks → keep inner content
  out = out.replace(/```[^\n]*\n([\s\S]*?)```/g, (_m, inner) => inner);
  // inline code `foo` → foo
  out = out.replace(/`([^`]+)`/g, "$1");
  // links [text](url) → text
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
  // citation markers [c1], [c12], … → drop entirely
  out = out.replace(/\[c\d+\]/g, "");
  // bold/italic markers
  out = out.replace(/\*\*([^*]+)\*\*/g, "$1");
  out = out.replace(/\*([^*]+)\*/g, "$1");
  // headings
  out = out.replace(/^#{1,6}\s+/gm, "");
  // list markers
  out = out.replace(/^\s*[-*]\s+/gm, "");
  out = out.replace(/^\s*\d+\.\s+/gm, "");
  // collapse stray double-spaces left behind by [cN] removal mid-line
  out = out.replace(/[ \t]{2,}/g, " ");
  // trim trailing spaces per line
  out = out
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/g, ""))
    .join("\n");
  return out.trim();
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onClick = useCallback(async () => {
    const plain = toPlainText(text);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(plain);
      }
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (older browser, insecure context) — silently
      // skip the confirmation; nothing to copy.
    }
  }, [text]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      aria-label={copied ? microcopy.buttons.copied : microcopy.meta.copyMessageAriaLabel}
      className="msg__copy"
    >
      {copied ? microcopy.buttons.copied : microcopy.buttons.copy}
    </Button>
  );
}

export default function Message({
  role,
  content,
  citations,
  noContext,
}: MessageProps) {
  const headerId = useId();
  return (
    <article
      data-role={role}
      className="msg"
      role="article"
      aria-labelledby={headerId}
    >
      <header id={headerId} className="t-meta msg__header">
        {role === "user" ? microcopy.meta.youLabel : microcopy.meta.assistantLabel}
      </header>
      <div className="message-body msg__body">
        {role === "assistant" && noContext ? (
          <p className="msg__no-context" data-testid="msg-no-context">
            {NO_CONTEXT_NOTE}
          </p>
        ) : null}
        {role === "user" ? (
          <p className="msg__user-line">{content}</p>
        ) : (
          <Markdown>{content}</Markdown>
        )}
        {role === "assistant" && content.length > 0 ? (
          <div className="msg__actions">
            <CopyButton text={content} />
          </div>
        ) : null}
      </div>
      {role === "assistant" && citations && citations.length > 0 ? (
        <CitationStrip items={citations} />
      ) : null}
    </article>
  );
}
