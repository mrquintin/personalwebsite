/* ---------------------------------------------------------------------------
 * ChatMessageList — suite 19/P01 (rendering) + 19/P05 (autoscroll + jump)
 * Renders the message stream and manages scroll behaviour:
 *   - autoscroll to bottom on new tokens when the user is "anchored" near
 *     the bottom of the viewport (within AUTOSCROLL_PX),
 *   - pause autoscroll once the user scrolls up past that threshold and
 *     surface a floating "↓ jump to bottom" button to resume.
 * --------------------------------------------------------------------------- */

"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import type { ClientChatMessage } from "@/lib/llm/chatTypes";
import Message from "./Message";
import RetryAffordance from "./RetryAffordance";
import type { CitationItem } from "./Citation";
import { microcopy } from "@/content/microcopy";

const AUTOSCROLL_PX = 60;

export type ChatMessage = ClientChatMessage;

type ChatMessageListProps = {
  messages?: ClientChatMessage[];
  lastError?: string;
  onRetry?: () => void;
  /**
   * Optional resolver to enrich a stored Citation (id/chunkId/snippet)
   * with the public-facing CitationItem fields (path/heading/etc.) the
   * Message component expects. When omitted, citations render with the
   * minimum metadata available.
   */
  resolveCitation?: (
    c: { id: string; chunkId: string; snippet: string },
  ) => CitationItem;
};

function defaultResolveCitation(c: {
  id: string;
  chunkId: string;
  snippet: string;
}): CitationItem {
  const path = c.chunkId.split("#")[0] ?? c.chunkId;
  return { id: c.id, chunkId: c.chunkId, snippet: c.snippet, path };
}

function isAnchoredToBottom(el: HTMLElement): boolean {
  const distance = el.scrollHeight - el.clientHeight - el.scrollTop;
  return distance <= AUTOSCROLL_PX;
}

export default function ChatMessageList({
  messages = [],
  lastError,
  onRetry,
  resolveCitation = defaultResolveCitation,
}: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // "Anchored": user is at (or within AUTOSCROLL_PX of) the bottom. While
  // anchored, new tokens cause smooth autoscroll. As soon as the user
  // scrolls up past the threshold, this flips false and the jump button
  // becomes visible until they return.
  const [anchored, setAnchored] = useState(true);
  const anchoredRef = useRef(true);
  anchoredRef.current = anchored;

  const scrollToBottom = useCallback((smooth: boolean) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Track scroll position to maintain the anchored flag.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const next = isAnchoredToBottom(el);
      if (next !== anchoredRef.current) setAnchored(next);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // iOS soft-keyboard handling. When the keyboard opens, the visual viewport
  // shrinks while the layout viewport may not (depending on browser). Mirror
  // visualViewport.height onto the message list's max-height so the latest
  // message stays visible above the keyboard. Also re-fire autoscroll on each
  // viewport change while anchored.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const vv = window.visualViewport;
    if (!vv) return;
    const el = containerRef.current;
    if (!el) return;

    function applyViewportHeight() {
      if (!el || !vv) return;
      const rect = el.getBoundingClientRect();
      const available = Math.max(0, vv.height - rect.top);
      el.style.maxHeight = `${available}px`;
      if (anchoredRef.current) {
        el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
      }
    }

    applyViewportHeight();
    vv.addEventListener("resize", applyViewportHeight);
    vv.addEventListener("scroll", applyViewportHeight);
    return () => {
      vv.removeEventListener("resize", applyViewportHeight);
      vv.removeEventListener("scroll", applyViewportHeight);
      if (el) el.style.maxHeight = "";
    };
  }, []);

  // Autoscroll on every render where messages changed (covers both new
  // messages and token deltas). Only applies when anchored. Uses a layout
  // effect so the scroll lands in the same frame as the new content.
  const lastContent = messages[messages.length - 1]?.content ?? "";
  const messageCount = messages.length;
  useLayoutEffect(() => {
    if (!anchoredRef.current) return;
    scrollToBottom(true);
  }, [messageCount, lastContent, scrollToBottom]);

  const handleJump = useCallback(() => {
    scrollToBottom(true);
    setAnchored(true);
  }, [scrollToBottom]);

  return (
    <div className="chat-messages-wrap">
      <div
        ref={containerRef}
        className="chat-messages"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label={microcopy.meta.chatLogAriaLabel}
      >
        {messages.length === 0 ? (
          <p className="chat-messages__empty">
            {microcopy.emptyStates.noConversation}
          </p>
        ) : (
          messages.map((m, idx) => {
            const items =
              m.role === "assistant" && m.citations
                ? m.citations.map(resolveCitation)
                : undefined;
            const isLast = idx === messages.length - 1;
            const showRetry =
              m.role === "assistant" && m.status === "error" && isLast;
            return (
              <div key={m.id} className="chat-messages__row">
                <Message
                  role={m.role}
                  content={m.content}
                  citations={items}
                  noContext={m.role === "assistant" ? m.noContext : undefined}
                />
                {showRetry && onRetry ? (
                  <RetryAffordance lastError={lastError} onRetry={onRetry} />
                ) : null}
              </div>
            );
          })
        )}
      </div>
      {!anchored && messages.length > 0 ? (
        <button
          type="button"
          className="chat-messages__jump"
          onClick={handleJump}
          aria-label={microcopy.buttons.jumpToBottom}
        >
          {microcopy.buttons.jumpToBottom}
        </button>
      ) : null}
    </div>
  );
}
