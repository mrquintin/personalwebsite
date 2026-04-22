// P06 §B — fixture integrity. Run at module load in dev; tree-shaken in production.
import { CLAIMS, EDGES } from "./claims";
import { QUADRANT_CASES } from "./quadrantCases";
import { DIAMOND_CASES } from "./diamondCases";
import { OBJECTIONS, RESPONSES } from "./objections";
import { THINKERS } from "./thinkers";
import { GLOSSARY } from "./glossary";

const PARAPHRASE_PREFIX = "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW]";

function check(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`[prp/typeGuards] ${msg}`);
}

function noUnreviewedString(s: string, ctx: string): void {
  // Author-approved items must NOT carry the paraphrase prefix.
  check(!s.startsWith(PARAPHRASE_PREFIX),
    `${ctx} is marked authorApproved but still carries the GUIDE PARAPHRASE prefix.`);
}

function assertClaims() {
  const ids = new Set<string>();
  for (const c of CLAIMS) {
    check(!ids.has(c.id), `duplicate claim id ${c.id}`);
    ids.add(c.id);
    check(c.statement.length > 0, `claim ${c.id} has empty statement`);
    if (c.authorApproved) noUnreviewedString(c.statement, `claim ${c.id} statement`);
  }
}

function assertEdges() {
  const ids = new Set(CLAIMS.map((c) => c.id));
  for (const e of EDGES) {
    check(ids.has(e.from), `edge from unknown claim ${e.from}`);
    check(ids.has(e.to),   `edge to unknown claim ${e.to}`);
  }
}

function assertCrossReferences() {
  const claimIds = new Set(CLAIMS.map((c) => c.id));
  const diamondIds = new Set(DIAMOND_CASES.map((d) => d.id));

  for (const q of QUADRANT_CASES)
    for (const ref of q.claimRefs)
      check(claimIds.has(ref), `quadrant case ${q.id} cites unknown claim ${ref}`);

  for (const d of DIAMOND_CASES)
    for (const ref of d.tagClaimIds)
      check(claimIds.has(ref), `diamond case ${d.id} tags unknown claim ${ref}`);

  for (const o of OBJECTIONS)
    for (const ref of o.targetClaimIds)
      check(claimIds.has(ref), `objection ${o.id} targets unknown claim ${ref}`);

  for (const r of Object.values(RESPONSES)) {
    check(claimIds.has(r.openInOntologyClaimId),
      `response ${r.id} cites unknown claim ${r.openInOntologyClaimId}`);
    if (r.openInDiamondCaseId)
      check(diamondIds.has(r.openInDiamondCaseId),
        `response ${r.id} cites unknown diamond case ${r.openInDiamondCaseId}`);
  }

  for (const t of THINKERS)
    for (const ref of t.connectedClaimIds)
      check(claimIds.has(ref), `thinker ${t.id} cites unknown claim ${ref}`);

  for (const g of GLOSSARY)
    for (const ref of g.connectedClaimIds)
      check(claimIds.has(ref), `glossary term "${g.term}" cites unknown claim ${ref}`);
}

let _ran = false;
export function assertFixtures(): void {
  if (_ran) return;
  _ran = true;
  if (process.env.NODE_ENV === "production") return; // tree-shaken
  assertClaims();
  assertEdges();
  assertCrossReferences();
}

if (process.env.NODE_ENV !== "production") {
  try { assertFixtures(); }
  catch (e) { console.error(e); }
}
