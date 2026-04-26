/* ---------------------------------------------------------------------------
 * useChat — suite 19/P03 + 19/P04
 * Client-side state machine for the chat conversation. Owns the message list,
 * issues SSE requests against /api/chat, progressively appends streamed
 * tokens to an assistant placeholder, and surfaces error / rate-limit state
 * so the UI can render a retry affordance.
 *
 * 19/P04: optional opt-in persistence to localStorage["llm.chat.history.v1"]
 * gated by the user-facing toggle pref at "llm.chat.persist.v1". The hook
 * coexists with the toggle housed in ChatHeader; both ends sync via storage
 * events (cross-tab) and a custom "llm-chat-persist-change" event (same tab).
 * --------------------------------------------------------------------------- */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  type ChatMetaPayload,
  type Citation,
  type ClientChatMessage,
} from "@/lib/llm/chatTypes";
import { streamReader } from "@/lib/llm/streamReader";
import { microcopy } from "@/content/microcopy";

export type ChatStatus = "idle" | "streaming" | "error";

export type UseChatReturn = {
  messages: ClientChatMessage[];
  status: ChatStatus;
  submit: (text: string) => Promise<void>;
  retry: () => Promise<void>;
  clear: () => void;
  stopStreaming: () => void;
  lastError?: string;
  persist: boolean;
  setPersist: (next: boolean) => void;
};

const HISTORY_KEY = "llm.chat.history.v1";
const PERSIST_KEY = "llm.chat.persist.v1";
const PERSIST_EVENT = "llm-chat-persist-change";
const HISTORY_CAP = 100;
const SERVER_HISTORY_LIMIT = 40;

let _idCounter = 0;
function nextId(prefix: string): string {
  _idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${_idCounter}`;
}

type ServerMessage = { role: "user" | "assistant"; content: string };

type RateLimitedBody = {
  error?: string;
  detail?: string;
  retryAfterSeconds?: number;
};

function friendlyErrorForStatus(
  status: number,
  body: RateLimitedBody | undefined,
): string {
  if (status === 400) {
    return microcopy.errors.validation;
  }
  if (status === 429) {
    const seconds =
      typeof body?.retryAfterSeconds === "number" && body.retryAfterSeconds > 0
        ? body.retryAfterSeconds
        : 0;
    const minutes = Math.max(1, Math.ceil(seconds / 60));
    return microcopy.errors.rateLimited(minutes);
  }
  if (status === 502 || status === 503) {
    return microcopy.errors.serverError;
  }
  if (typeof body?.detail === "string" && body.detail) {
    return body.detail;
  }
  return microcopy.errors.requestFailed(status);
}

function readPersistPref(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(PERSIST_KEY) === "1";
  } catch {
    return false;
  }
}

function readHistory(): ClientChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const restored: ClientChatMessage[] = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") continue;
      const m = entry as Record<string, unknown>;
      if (typeof m.id !== "string") continue;
      if (typeof m.content !== "string") continue;
      if (m.role !== "user" && m.role !== "assistant") continue;
      if (typeof m.createdAt !== "number") continue;
      const status =
        m.status === "error" || m.status === "streaming"
          ? "complete"
          : "complete";
      restored.push({
        id: m.id,
        role: m.role,
        content: m.content,
        status,
        createdAt: m.createdAt,
        citations: Array.isArray(m.citations)
          ? (m.citations as Citation[])
          : undefined,
      });
    }
    return restored.slice(-HISTORY_CAP);
  } catch {
    return [];
  }
}

function writeHistory(messages: ClientChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = messages
      .filter((m) => m.status !== "streaming")
      .slice(-HISTORY_CAP);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // quota exceeded or storage unavailable — degrade silently.
  }
}

function clearHistoryStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}

function writePersistPref(next: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (next) window.localStorage.setItem(PERSIST_KEY, "1");
    else window.localStorage.removeItem(PERSIST_KEY);
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(
      new CustomEvent(PERSIST_EVENT, { detail: { value: next } }),
    );
  } catch {
    // ignore
  }
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ClientChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [lastError, setLastError] = useState<string | undefined>(undefined);
  const [persist, setPersistState] = useState<boolean>(false);

  const abortRef = useRef<AbortController | null>(null);
  const lastUserTextRef = useRef<string | null>(null);
  const messagesRefSnapshot = useRef<ClientChatMessage[]>([]);
  messagesRefSnapshot.current = messages;
  const persistRef = useRef<boolean>(false);
  persistRef.current = persist;
  const hydratedRef = useRef<boolean>(false);

  // Hydrate from localStorage on mount: read persistence pref and, if on,
  // restore prior messages. This runs once.
  useEffect(() => {
    const pref = readPersistPref();
    setPersistState(pref);
    if (pref) {
      const restored = readHistory();
      if (restored.length > 0) {
        setMessages(restored);
        const lastUser = [...restored]
          .reverse()
          .find((m) => m.role === "user");
        if (lastUser) lastUserTextRef.current = lastUser.content;
      }
    }
    hydratedRef.current = true;
  }, []);

  // Persist message list to localStorage whenever it changes — but only if
  // the user has opted in. Skipped before hydration so we don't blow away
  // existing storage with the empty initial state.
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (!persist) return;
    writeHistory(messages);
  }, [persist, messages]);

  // Cross-tab + same-tab pref/history sync.
  useEffect(() => {
    if (typeof window === "undefined") return;

    function onStorage(e: StorageEvent) {
      if (e.key === PERSIST_KEY) {
        const next = e.newValue === "1";
        setPersistState(next);
        if (next) {
          const restored = readHistory();
          if (restored.length > 0) setMessages(restored);
        }
      } else if (e.key === HISTORY_KEY) {
        if (!persistRef.current) return;
        if (e.newValue === null) {
          setMessages([]);
        } else {
          const restored = readHistory();
          setMessages(restored);
        }
      }
    }

    function onLocalPref(e: Event) {
      const ce = e as CustomEvent<{ value: boolean }>;
      const next = Boolean(ce.detail?.value);
      setPersistState(next);
      if (next) {
        // Pref just turned on — flush current messages so a reload restores.
        writeHistory(messagesRefSnapshot.current);
      } else {
        clearHistoryStorage();
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(PERSIST_EVENT, onLocalPref as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PERSIST_EVENT, onLocalPref as EventListener);
    };
  }, []);

  const setPersist = useCallback((next: boolean) => {
    setPersistState(next);
    writePersistPref(next);
    if (next) {
      writeHistory(messagesRefSnapshot.current);
    } else {
      clearHistoryStorage();
    }
  }, []);

  const updateMessage = useCallback(
    (id: string, patch: Partial<ClientChatMessage>) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      );
    },
    [],
  );

  const appendToken = useCallback((id: string, token: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, content: m.content + token } : m,
      ),
    );
  }, []);

  const runStream = useCallback(
    async (historyForServer: ServerMessage[], placeholderId: string) => {
      setStatus("streaming");
      setLastError(undefined);

      const controller = new AbortController();
      abortRef.current = controller;

      let response: Response;
      try {
        response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyForServer }),
          signal: controller.signal,
        });
      } catch (err) {
        abortRef.current = null;
        if (controller.signal.aborted) {
          updateMessage(placeholderId, { status: "complete" });
          setStatus("idle");
          return;
        }
        const detail = microcopy.errors.networkLost;
        console.error("[useChat] network error", err);
        updateMessage(placeholderId, { status: "error" });
        setLastError(detail);
        setStatus("error");
        return;
      }

      if (!response.ok) {
        let body: RateLimitedBody | undefined;
        try {
          body = (await response.json()) as RateLimitedBody;
        } catch {
          body = undefined;
        }
        const detail = friendlyErrorForStatus(response.status, body);
        abortRef.current = null;
        updateMessage(placeholderId, { status: "error" });
        setLastError(detail);
        setStatus("error");
        return;
      }

      try {
        for await (const frame of streamReader(response)) {
          if (frame.event === "token") {
            let token: string;
            try {
              token = JSON.parse(frame.data) as string;
            } catch {
              token = frame.data;
            }
            if (typeof token === "string" && token.length > 0) {
              appendToken(placeholderId, token);
            }
          } else if (frame.event === "meta") {
            try {
              const meta = JSON.parse(frame.data) as ChatMetaPayload;
              const citations: Citation[] = (meta.citations ?? []).map(
                (c) => ({
                  id: c.id,
                  chunkId: c.chunkId,
                  snippet: c.snippet,
                }),
              );
              const noContext =
                typeof meta.retrievedCount === "number"
                  ? meta.retrievedCount === 0
                  : citations.length === 0;
              updateMessage(placeholderId, { citations, noContext });
            } catch {
              // malformed meta — ignore.
            }
          } else if (frame.event === "error") {
            let detail: string = microcopy.errors.serverError;
            try {
              const body = JSON.parse(frame.data) as { detail?: string };
              if (typeof body?.detail === "string" && body.detail) {
                detail = body.detail;
              }
            } catch {
              // ignore
            }
            abortRef.current = null;
            updateMessage(placeholderId, { status: "error" });
            setLastError(detail);
            setStatus("error");
            return;
          } else if (frame.event === "done") {
            break;
          }
        }

        updateMessage(placeholderId, { status: "complete" });
        setStatus("idle");
      } catch (err) {
        if (controller.signal.aborted) {
          updateMessage(placeholderId, { status: "complete" });
          setStatus("idle");
          return;
        }
        console.error("[useChat] stream failed", err);
        const detail = microcopy.errors.networkLost;
        updateMessage(placeholderId, { status: "error" });
        setLastError(detail);
        setStatus("error");
      } finally {
        abortRef.current = null;
      }
    },
    [appendToken, updateMessage],
  );

  const submit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (abortRef.current) return; // already streaming

      const now = Date.now();
      const userMsg: ClientChatMessage = {
        id: nextId("u"),
        role: "user",
        content: trimmed,
        status: "complete",
        createdAt: now,
      };
      const placeholder: ClientChatMessage = {
        id: nextId("a"),
        role: "assistant",
        content: "",
        status: "streaming",
        createdAt: now + 1,
      };

      lastUserTextRef.current = trimmed;

      // Capture the latest message list synchronously so the request payload
      // includes the just-pushed user message — useState updates don't flush
      // before the request is built. Cap to last SERVER_HISTORY_LIMIT entries
      // so we never exceed the server-side validation ceiling even if the
      // local cache holds up to HISTORY_CAP.
      const fullHistory: ServerMessage[] = messagesRefSnapshot.current
        .filter((m) => m.status === "complete")
        .map((m) => ({ role: m.role, content: m.content }));
      fullHistory.push({ role: "user", content: trimmed });
      const historyForServer = fullHistory.slice(-SERVER_HISTORY_LIMIT);

      setMessages((prev) => [...prev, userMsg, placeholder]);

      await runStream(historyForServer, placeholder.id);
    },
    [runStream],
  );

  const retry = useCallback(async () => {
    if (abortRef.current) return;
    const lastText = lastUserTextRef.current;
    if (!lastText) return;

    let placeholderId = "";
    setMessages((prev) => {
      const next = [...prev];
      while (
        next.length > 0 &&
        next[next.length - 1].role === "assistant" &&
        next[next.length - 1].status !== "complete"
      ) {
        next.pop();
      }
      const newPlaceholder: ClientChatMessage = {
        id: nextId("a"),
        role: "assistant",
        content: "",
        status: "streaming",
        createdAt: Date.now(),
      };
      placeholderId = newPlaceholder.id;
      next.push(newPlaceholder);
      return next;
    });

    const fullHistory: ServerMessage[] = messagesRefSnapshot.current
      .filter((m) => m.status === "complete")
      .map((m) => ({ role: m.role, content: m.content }));
    if (
      fullHistory.length === 0 ||
      fullHistory[fullHistory.length - 1].role !== "user" ||
      fullHistory[fullHistory.length - 1].content !== lastText
    ) {
      fullHistory.push({ role: "user", content: lastText });
    }
    const historyForServer = fullHistory.slice(-SERVER_HISTORY_LIMIT);

    await runStream(historyForServer, placeholderId);
  }, [runStream]);

  const clear = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setMessages([]);
    setStatus("idle");
    setLastError(undefined);
    lastUserTextRef.current = null;
    clearHistoryStorage();
  }, []);

  const stopStreaming = useCallback(() => {
    const ctrl = abortRef.current;
    if (!ctrl) return;
    ctrl.abort();
    abortRef.current = null;
    setStatus("idle");
  }, []);

  return {
    messages,
    status,
    submit,
    retry,
    clear,
    stopStreaming,
    lastError,
    persist,
    setPersist,
  };
}
