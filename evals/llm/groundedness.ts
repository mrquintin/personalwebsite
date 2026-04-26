/**
 * Groundedness checker.
 *
 * Three sub-scores:
 *   1. retrievalRecall  — fraction of expectGroundedAt path-prefixes that
 *                          appear among the retrieved citations' paths.
 *                          1.0 if expectGroundedAt is empty.
 *   2. citationCoverage — fraction of [c?] markers used out of those
 *                          available, capped at 1.0. 1.0 if no citations
 *                          were available.
 *   3. factualGrounding — heuristic NER-ish entity extraction on the
 *                          response, then check each entity is mentioned
 *                          somewhere in the retrieved chunks.
 *
 * Final score is the unweighted mean of the three sub-scores. The
 * per-criterion breakdown lets the report flag which axis dropped.
 */
import type { EvalCase } from "./cases";

export type Citation = {
  id: string;
  chunkId: string;
  snippet: string;
  path?: string;
};

export type RetrievedChunk = {
  chunkId: string;
  path: string;
  text: string;
};

export type GroundednessInput = {
  case: EvalCase;
  response: string;
  citations: Citation[];
  retrieved: RetrievedChunk[];
};

export type GroundednessReport = {
  score: number;
  retrievalRecall: number;
  citationCoverage: number;
  factualGrounding: number;
  citationMarkers: string[];
  unverifiedEntities: string[];
  recallHits: string[];
  recallMisses: string[];
};

const CITATION_RE = /\[c\d+\]/g;

const STOPWORDS = new Set<string>([
  "The",
  "This",
  "That",
  "These",
  "Those",
  "There",
  "Then",
  "When",
  "Where",
  "Which",
  "What",
  "Who",
  "Why",
  "How",
  "Here",
  "Hivemind",
  "Theseus",
  "I",
  "I'm",
  "I've",
  "I'll",
  "It",
  "Its",
  "Mr",
  "Mrs",
  "Ms",
  "Dr",
  "If",
  "And",
  "But",
  "Or",
  "Not",
  "No",
  "Yes",
  "Yeah",
  "Okay",
  "OK",
  "We",
  "You",
  "They",
  "He",
  "She",
  "His",
  "Her",
  "Their",
  "My",
  "Our",
  "Your",
  "Mine",
  "Yours",
]);

export function scoreGroundedness(
  input: GroundednessInput
): GroundednessReport {
  const { case: kase, response, citations, retrieved } = input;

  const citationMarkers = response.match(CITATION_RE) ?? [];
  const uniqueMarkers = Array.from(new Set(citationMarkers));

  const recall = computeRetrievalRecall(kase.expectGroundedAt, citations);
  const coverage = computeCitationCoverage(uniqueMarkers, citations);
  const factual = computeFactualGrounding(response, retrieved);

  const score = (recall.value + coverage.value + factual.value) / 3;

  return {
    score: round(score),
    retrievalRecall: round(recall.value),
    citationCoverage: round(coverage.value),
    factualGrounding: round(factual.value),
    citationMarkers: uniqueMarkers,
    unverifiedEntities: factual.unverified,
    recallHits: recall.hits,
    recallMisses: recall.misses,
  };
}

function computeRetrievalRecall(
  expected: string[],
  citations: Citation[]
): { value: number; hits: string[]; misses: string[] } {
  if (expected.length === 0) {
    return { value: 1, hits: [], misses: [] };
  }
  const paths = citations.map((c) => (c.path ?? "").toLowerCase());
  const hits: string[] = [];
  const misses: string[] = [];
  for (const need of expected) {
    const needle = need.toLowerCase();
    const found = paths.some((p) => p.includes(needle));
    if (found) hits.push(need);
    else misses.push(need);
  }
  return {
    value: hits.length / expected.length,
    hits,
    misses,
  };
}

function computeCitationCoverage(
  markers: string[],
  citations: Citation[]
): { value: number } {
  if (citations.length === 0) {
    // Nothing to cite — coverage is vacuously full.
    return { value: 1 };
  }
  const referencedIds = new Set(
    markers.map((m) => m.replace(/[[\]]/g, "").toLowerCase())
  );
  const available = new Set(citations.map((c) => c.id.toLowerCase()));
  let used = 0;
  for (const id of available) {
    if (referencedIds.has(id)) used += 1;
  }
  return { value: used / available.size };
}

function computeFactualGrounding(
  response: string,
  retrieved: RetrievedChunk[]
): { value: number; unverified: string[] } {
  const entities = extractEntities(response);
  if (entities.length === 0) {
    return { value: 1, unverified: [] };
  }
  const haystack = retrieved
    .map((r) => r.text.toLowerCase())
    .join("\n");
  if (!haystack) {
    return { value: 0, unverified: entities };
  }
  const unverified: string[] = [];
  for (const ent of entities) {
    if (!haystack.includes(ent.toLowerCase())) unverified.push(ent);
  }
  const verified = entities.length - unverified.length;
  return {
    value: verified / entities.length,
    unverified,
  };
}

/**
 * Heuristic NER: capture sequences of capitalized tokens (proper nouns)
 * and 4-digit years. Filters short stopwords and pronouns. Good enough
 * for "did the model invent a project name?" detection.
 */
export function extractEntities(text: string): string[] {
  const found = new Set<string>();

  const properNoun = /\b([A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+){0,3})\b/g;
  for (const match of text.matchAll(properNoun)) {
    const phrase = match[1].trim();
    if (!phrase) continue;
    const tokens = phrase.split(/\s+/);
    if (tokens.every((t) => STOPWORDS.has(t))) continue;
    if (tokens.length === 1 && STOPWORDS.has(tokens[0])) continue;
    if (tokens.length === 1 && tokens[0].length <= 2) continue;
    found.add(phrase);
  }

  const yearLike = /\b(19|20)\d{2}\b/g;
  for (const match of text.matchAll(yearLike)) {
    found.add(match[0]);
  }

  return Array.from(found);
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
