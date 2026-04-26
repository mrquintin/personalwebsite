"use client";

import {
  useEffect,
  useRef,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Button from "@/components/primitives/Button";
import Cluster from "@/components/primitives/Cluster";
import { microcopy } from "@/content/microcopy";

const MAX_LEN = 4000;
const MAX_ROWS = 6;

type ChatInputProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isStreaming: boolean;
  /**
   * Optional handler invoked when the global focus-input shortcut fires
   * (Cmd/Ctrl+K or "/" outside an editable element). The default behavior
   * focuses the textarea and scrolls the viewport to the bottom.
   */
  onFocusShortcut?: () => void;
};

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming,
  onFocusShortcut,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const charCount = value.length;
  const trimmed = value.trim();
  const canSubmit = !isStreaming && trimmed.length > 0 && charCount <= MAX_LEN;
  const isStreamingRef = useRef(isStreaming);
  isStreamingRef.current = isStreaming;
  const onStopRef = useRef(onStop);
  onStopRef.current = onStop;
  const onFocusShortcutRef = useRef(onFocusShortcut);
  onFocusShortcutRef.current = onFocusShortcut;

  // Global keyboard shortcuts: Cmd/Ctrl+K and bare "/" focus the textarea
  // and scroll to bottom. Skipped when an editable element already has focus
  // so the "/" shortcut doesn't hijack normal typing in another field.
  useEffect(() => {
    if (typeof window === "undefined") return;
    function isEditableTarget(t: EventTarget | null): boolean {
      if (!(t instanceof HTMLElement)) return false;
      const tag = t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (t.isContentEditable) return true;
      return false;
    }
    function handleGlobal(e: globalThis.KeyboardEvent) {
      const cmdK = (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K");
      const slash = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (!cmdK && !slash) return;
      if (slash && isEditableTarget(e.target)) return;
      e.preventDefault();
      const ta = textareaRef.current;
      if (ta) {
        ta.focus();
        try {
          const len = ta.value.length;
          ta.setSelectionRange(len, len);
        } catch {
          // ignore if browser disallows
        }
        ta.scrollIntoView({ block: "end", behavior: "smooth" });
      }
      if (onFocusShortcutRef.current) onFocusShortcutRef.current();
    }
    window.addEventListener("keydown", handleGlobal);
    return () => window.removeEventListener("keydown", handleGlobal);
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    // Cap auto-grow at MAX_ROWS lines; beyond that the textarea scrolls.
    const styles = window.getComputedStyle(ta);
    const lineHeight = parseFloat(styles.lineHeight) || 0;
    const padTop = parseFloat(styles.paddingTop) || 0;
    const padBottom = parseFloat(styles.paddingBottom) || 0;
    const borderTop = parseFloat(styles.borderTopWidth) || 0;
    const borderBottom = parseFloat(styles.borderBottomWidth) || 0;
    const cap =
      lineHeight * MAX_ROWS + padTop + padBottom + borderTop + borderBottom;
    const next = Math.min(ta.scrollHeight, cap || ta.scrollHeight);
    ta.style.height = `${next}px`;
  }, [value]);

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value.slice(0, MAX_LEN);
    onChange(next);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) onSubmit();
      return;
    }
    if (e.key === "Escape") {
      if (isStreamingRef.current && onStopRef.current) {
        e.preventDefault();
        onStopRef.current();
      } else {
        e.preventDefault();
        textareaRef.current?.blur();
      }
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isStreaming) {
      if (onStop) onStop();
      return;
    }
    if (canSubmit) onSubmit();
  }

  function handleStopClick() {
    if (onStop) onStop();
  }

  const overLimit = charCount > MAX_LEN;

  return (
    <form
      className="chat-input"
      onSubmit={handleSubmit}
      aria-label={microcopy.meta.chatInputFormLabel}
    >
      <label htmlFor="chat-input-field" className="sr-only">
        {microcopy.meta.chatInputAriaLabel}
      </label>
      <textarea
        id="chat-input-field"
        ref={textareaRef}
        className="chat-input__field"
        rows={2}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={microcopy.placeholders.chatInput}
        maxLength={MAX_LEN}
        aria-label={microcopy.meta.chatInputAriaLabel}
        readOnly={isStreaming}
      />
      <Cluster gap={2} justify="space-between">
        {isStreaming ? (
          <Button
            type="button"
            variant="ghost"
            tone="neutral"
            onClick={handleStopClick}
            disabled={!onStop}
            className="chat-input__send"
          >
            {microcopy.buttons.stop}
          </Button>
        ) : (
          <Button
            type="submit"
            variant="solid"
            tone="accent"
            disabled={!canSubmit}
            className="chat-input__send"
          >
            {microcopy.buttons.ask}
          </Button>
        )}
        <span
          className={
            "chat-input__count" +
            (overLimit ? " chat-input__count--over" : "")
          }
          aria-live="polite"
        >
          {charCount} / {MAX_LEN}
        </span>
      </Cluster>
    </form>
  );
}
