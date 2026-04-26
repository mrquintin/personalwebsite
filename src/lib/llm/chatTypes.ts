import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export const chatRequestSchema = z
  .object({
    messages: z.array(chatMessageSchema).min(1).max(40),
    topicHints: z.array(z.string()).optional(),
  })
  .refine((req) => req.messages[req.messages.length - 1]?.role === "user", {
    message: "latest message must have role 'user'",
    path: ["messages"],
  });

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export type ChatMetaPayload = {
  citations: { id: string; chunkId: string; snippet: string }[];
  usage: { inputTokens?: number; outputTokens?: number };
  retrievedCount: number;
};

export type ChatErrorBody = {
  error: string;
  detail?: string;
};

/* ---------------------------------------------------------------------------
 * Client-side types — used by the useChat hook and chat UI.
 * --------------------------------------------------------------------------- */

export type Citation = {
  id: string;
  chunkId: string;
  snippet: string;
};

export type ChatMessageStatus = "complete" | "streaming" | "error";

export type ClientChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  status: ChatMessageStatus;
  createdAt: number;
  /**
   * For assistant messages: true when retrieval returned zero corpus chunks,
   * so the answer is in the speaker's voice but not grounded in any specific
   * source. The UI surfaces an inline note above the message body.
   */
  noContext?: boolean;
};
