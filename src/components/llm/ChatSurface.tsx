"use client";

import { useEffect, useState } from "react";
import Container from "@/components/primitives/Container";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import ErrorBoundary from "./ErrorBoundary";
import { useChat } from "./useChat";
import { microcopy } from "@/content/microcopy";

function ChatSurfaceInner() {
  const chat = useChat();
  const [draft, setDraft] = useState("");
  const isStreaming = chat.status === "streaming";

  // Mark this page so the global SiteFooter can hide itself.
  useEffect(() => {
    const prev = document.body.dataset.page;
    document.body.dataset.page = "chat";
    return () => {
      if (prev === undefined) delete document.body.dataset.page;
      else document.body.dataset.page = prev;
    };
  }, []);

  // Mirror visualViewport.height onto a CSS variable on the documentElement
  // so the chat surface and its children can size against the post-keyboard
  // viewport on iOS. Scoped to the chat page via the [data-page="chat"]
  // attribute that the effect above sets on the body.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;

    function update() {
      if (!vv) return;
      root.style.setProperty("--chat-vv-height", `${vv.height}px`);
    }
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      root.style.removeProperty("--chat-vv-height");
    };
  }, []);

  function handleSubmit() {
    const value = draft;
    setDraft("");
    void chat.submit(value);
  }

  return (
    <Container
      size="narrow"
      as="section"
      className="chat-surface"
      role="region"
      aria-label={microcopy.meta.chatRegionLabel}
    >
      <ChatHeader
        onClear={chat.clear}
        hasMessages={chat.messages.length > 0}
      />
      <ChatMessageList
        messages={chat.messages}
        lastError={chat.lastError}
        onRetry={chat.retry}
      />
      <ChatInput
        value={draft}
        onChange={setDraft}
        onSubmit={handleSubmit}
        onStop={chat.stopStreaming}
        isStreaming={isStreaming}
      />
    </Container>
  );
}

export default function ChatSurface() {
  return (
    <ErrorBoundary>
      <ChatSurfaceInner />
    </ErrorBoundary>
  );
}
