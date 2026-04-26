/**
 * Voice checker.
 *
 * Counts case-insensitive occurrences of `personaConfig.voice.tells` and
 * `personaConfig.voice.avoid`. Any "avoid" hit is a fail-stop (score 0
 * regardless of tells). Otherwise score = clamp01(tellsHit / tellsTarget)
 * with a floor that doesn't punish short responses where 0 tells is fine.
 *
 * Per spec §D: phrase-list comparison only — no LLM-as-judge here.
 */
import type { EvalCase } from "./cases";
import { personaConfig } from "@/content/llm/persona";

export type VoiceReport = {
  score: number;
  tellsFound: { phrase: string; count: number }[];
  avoidsFound: { phrase: string; count: number }[];
  failStop: boolean;
  tellsTotal: number;
  avoidsTotal: number;
};

export function scoreVoice(args: {
  case: EvalCase;
  response: string;
}): VoiceReport {
  const { case: kase, response } = args;

  const tellsFound = countPhrases(response, personaConfig.voice.tells);
  const avoidsFound = countPhrases(response, personaConfig.voice.avoid);

  const tellsTotal = tellsFound.reduce((s, t) => s + t.count, 0);
  const avoidsTotal = avoidsFound.reduce((s, t) => s + t.count, 0);

  const failStop = avoidsTotal > 0;
  let score: number;

  if (failStop) {
    score = 0;
  } else if (kase.voiceTargets.tells === 0) {
    // Cases with no tells expectation get full credit when no avoids hit.
    score = 1;
  } else {
    score = Math.min(1, tellsTotal / kase.voiceTargets.tells);
  }

  return {
    score: round(score),
    tellsFound: tellsFound.filter((t) => t.count > 0),
    avoidsFound: avoidsFound.filter((t) => t.count > 0),
    failStop,
    tellsTotal,
    avoidsTotal,
  };
}

function countPhrases(
  text: string,
  phrases: string[]
): { phrase: string; count: number }[] {
  const haystack = text.toLowerCase();
  return phrases.map((phrase) => {
    const needle = stripVerbHint(phrase).toLowerCase();
    if (!needle) return { phrase, count: 0 };
    const re = new RegExp(escapeRegExp(needle), "g");
    const matches = haystack.match(re);
    return { phrase, count: matches ? matches.length : 0 };
  });
}

/**
 * "leverage (as a verb)" is in the avoid list. Strip the parenthetical
 * note so the substring match still catches the actual word.
 */
function stripVerbHint(phrase: string): string {
  return phrase.replace(/\s*\([^)]*\)\s*/g, "").trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
