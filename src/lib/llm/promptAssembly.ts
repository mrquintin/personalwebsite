/**
 * Prompt assembly for the RAG chat path.
 *
 * Composes the system prompt (persona + retrieval grounding instructions +
 * a `<retrieved_context>` block) and the user/assistant message sequence
 * sent to Claude. Token budgeting keeps the request within the model's
 * context window with margin for the response.
 *
 * Budget rules (see §B3 of P07):
 *   - 4000 tokens reserved for the response
 *   - persona / history / user message use their actual token cost
 *   - the remainder is the retrieved-context budget
 *   - chunks that don't fit are dropped lowest-score-first (i.e. we keep
 *     the highest-scoring chunks until the budget runs out)
 */
import { countTokens } from "@anthropic-ai/tokenizer";

import type { Retrieved } from "@/lib/llm/retriever";

const DEFAULT_MAX_CONTEXT_TOKENS = 16000;
const RESPONSE_RESERVE_TOKENS = 4000;
const HISTORY_TURNS_KEPT = 6;

const INSTRUCTION = `

You answer using ONLY the retrieved context below when making claims about the speaker's specific work, opinions, or experiences. If the context does not support an answer, say so. Do not fabricate.

Cite each retrieved chunk you use by its [id]. Place citations inline immediately after the claim they support.

Voice: write in the speaker's voice. The retrieved chunks are samples of that voice; mirror their cadence, register, and word choice.`;

export type AssembledPrompt = {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  citations: { id: string; chunkId: string; snippet: string }[];
  tokenBudget: { used: number; max: number };
};

export interface AssemblePromptArgs {
  persona: string;
  retrieved: Retrieved[];
  history: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
  maxContextTokens?: number;
}

export async function assemblePrompt(
  args: AssemblePromptArgs
): Promise<AssembledPrompt> {
  const max = args.maxContextTokens ?? DEFAULT_MAX_CONTEXT_TOKENS;

  const trimmedHistory = args.history.slice(-HISTORY_TURNS_KEPT);

  const personaTokens = countTokens(args.persona);
  const instructionTokens = countTokens(INSTRUCTION);
  const historyTokens = trimmedHistory.reduce(
    (sum, m) => sum + countTokens(m.content),
    0
  );
  const userMessageTokens = countTokens(args.userMessage);

  const fixedTokens =
    personaTokens + instructionTokens + historyTokens + userMessageTokens;
  const availableForRetrieved = Math.max(
    0,
    max - RESPONSE_RESERVE_TOKENS - fixedTokens
  );

  const sorted = [...args.retrieved].sort((a, b) => b.score - a.score);

  type Fitted = { id: string; chunk: Retrieved; rendered: string };
  const fitted: Fitted[] = [];

  // Reserve token cost for the wrapper tags around the retrieved block so
  // we don't underestimate. Empty when no chunks are present.
  const wrapperTokens =
    sorted.length > 0
      ? countTokens("\n\n<retrieved_context>\n</retrieved_context>")
      : 0;

  let usedRetrievedTokens = 0;
  for (const r of sorted) {
    const id = `c${fitted.length + 1}`;
    const rendered = renderChunk(id, r);
    const renderedTokens = countTokens(rendered + "\n\n");
    if (
      wrapperTokens + usedRetrievedTokens + renderedTokens <=
      availableForRetrieved
    ) {
      fitted.push({ id, chunk: r, rendered });
      usedRetrievedTokens += renderedTokens;
    } else {
      // Stop on first miss: dropping a higher-scoring chunk to fit a
      // lower-scoring one would violate "drop lowest-score-first".
      break;
    }
  }

  let system = args.persona + INSTRUCTION;
  if (fitted.length > 0) {
    system += "\n\n<retrieved_context>\n";
    for (const { rendered } of fitted) {
      system += rendered + "\n\n";
    }
    system += "</retrieved_context>";
  }

  const messages: { role: "user" | "assistant"; content: string }[] = [
    ...trimmedHistory,
    { role: "user", content: args.userMessage },
  ];

  const citations = fitted.map(({ id, chunk }) => ({
    id,
    chunkId: chunk.chunkId,
    snippet: chunk.text.slice(0, 200),
  }));

  const used =
    countTokens(system) +
    messages.reduce((s, m) => s + countTokens(m.content), 0);

  return {
    system,
    messages,
    citations,
    tokenBudget: { used, max },
  };
}

function renderChunk(id: string, r: Retrieved): string {
  const label = r.heading ?? r.section ?? r.path;
  const kind = r.kind || "doc";
  return `[${id}] from "${label}" (${kind})\n${r.text}`;
}
