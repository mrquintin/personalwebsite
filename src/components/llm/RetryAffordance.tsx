/* ---------------------------------------------------------------------------
 * RetryAffordance — suite 19/P05
 * Inline error + retry control rendered beneath an assistant message that
 * ended in status="error". The retry button re-issues the last user turn
 * via useChat.retry().
 * --------------------------------------------------------------------------- */

"use client";

import Button from "@/components/primitives/Button";
import Cluster from "@/components/primitives/Cluster";
import Surface from "@/components/primitives/Surface";
import { microcopy } from "@/content/microcopy";

export type RetryAffordanceProps = {
  lastError?: string;
  onRetry: () => void;
};

export default function RetryAffordance({
  lastError,
  onRetry,
}: RetryAffordanceProps) {
  const detail =
    lastError && lastError.length > 0 ? lastError : microcopy.errors.unknown;
  return (
    <Surface tone="mute" border padding={4} className="msg-retry">
      <Cluster gap={3}>
        <span
          className="t-mono-body msg-retry__detail"
          style={{ color: "var(--error)" }}
        >
          {microcopy.errors.failedPrefix}: {detail}
        </span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {microcopy.buttons.retry}
        </Button>
      </Cluster>
    </Surface>
  );
}
