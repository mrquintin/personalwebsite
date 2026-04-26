"use client";

import { useEffect, useId, useState, type ChangeEvent } from "react";

import Button from "@/components/primitives/Button";
import { microcopy } from "@/content/microcopy";

const PERSIST_KEY = "llm.chat.persist.v1";
const PERSIST_EVENT = "llm-chat-persist-change";

export type ChatHeaderProps = {
  onClear?: () => void;
  hasMessages?: boolean;
};

function readPersistPref(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(PERSIST_KEY) === "1";
  } catch {
    return false;
  }
}

export default function ChatHeader({ onClear, hasMessages = false }: ChatHeaderProps = {}) {
  const toggleId = useId();
  const [persist, setPersist] = useState<boolean>(false);

  function handleClear() {
    if (!onClear) return;
    if (typeof window !== "undefined" && typeof window.confirm === "function") {
      const ok = window.confirm(microcopy.confirms.clearChat);
      if (!ok) return;
    }
    onClear();
  }

  useEffect(() => {
    setPersist(readPersistPref());

    function onStorage(e: StorageEvent) {
      if (e.key === PERSIST_KEY) setPersist(e.newValue === "1");
    }
    function onLocalPref(e: Event) {
      const ce = e as CustomEvent<{ value: boolean }>;
      if (ce.detail) setPersist(Boolean(ce.detail.value));
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(PERSIST_EVENT, onLocalPref as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PERSIST_EVENT, onLocalPref as EventListener);
    };
  }, []);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.checked;
    setPersist(next);
    try {
      if (next) window.localStorage.setItem(PERSIST_KEY, "1");
      else window.localStorage.removeItem(PERSIST_KEY);
    } catch {
      // storage unavailable — fall back to in-memory only.
    }
    try {
      window.dispatchEvent(
        new CustomEvent(PERSIST_EVENT, { detail: { value: next } }),
      );
    } catch {
      // ignore
    }
  }

  return (
    <header className="chat-header">
      <h1 className="chat-header__heading">{microcopy.meta.chatHeading}</h1>
      <p className="chat-header__subhead">{microcopy.meta.chatSubhead}</p>
      <p className="chat-header__meta">
        <a href="/about#llm" className="chat-header__link">
          {microcopy.meta.chatGroundingLink}
        </a>
      </p>
      <div className="chat-header__persist">
        <label
          htmlFor={toggleId}
          className="chat-header__persist-label"
        >
          <input
            id={toggleId}
            type="checkbox"
            checked={persist}
            onChange={handleChange}
            className="chat-header__persist-input"
          />
          <span>{microcopy.meta.persistLabel}</span>
        </label>
        <p className="chat-header__persist-note">
          {microcopy.meta.persistNote}
        </p>
      </div>
      {onClear ? (
        <div className="chat-header__actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!hasMessages}
            className="chat-header__clear"
          >
            {microcopy.buttons.clear}
          </Button>
        </div>
      ) : null}
    </header>
  );
}
