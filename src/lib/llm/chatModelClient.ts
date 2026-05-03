import {
  getAnthropicClient,
  type AnthropicLike,
} from "./anthropicClient";
import { getOpenAIChatClient } from "./openAIChatClient";

export type ChatModelProvider = "anthropic" | "openai";
export type ChatModelLike = AnthropicLike;

export function getChatModelProvider(): ChatModelProvider {
  const configured = process.env.LLM_PROVIDER?.toLowerCase();
  if (configured === "openai" || configured === "anthropic") {
    return configured;
  }
  return "anthropic";
}

export function getChatModelClient(): ChatModelLike {
  return getChatModelProvider() === "openai"
    ? getOpenAIChatClient()
    : getAnthropicClient();
}
