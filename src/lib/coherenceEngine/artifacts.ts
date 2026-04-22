// Decision artifacts for each fixture DecisionInput. The artifact is built
// from the input + the gate-run-result. The artifact_hash is omitted from
// the canonicalized payload before hashing so the hash binds the input and
// outcome but not itself.
import type { DecisionInput, DecisionInputWithVariants, GateKey, GateRunResult, Regime } from "./decisionInputs";
import { DECISION_INPUTS } from "./decisionInputs";

export interface DecisionArtifact {
  schema_version: 1;
  policy_version: "decision-policy-v1.0.0";
  parameter_set_id: "params-v1";
  input: DecisionInput;
  csReq: GateRunResult["csReq"];
  csObserved: number;
  outcome: "pass" | "fail" | "manual_review";
  failed_gates: GateKey[];
  reason_codes: string[];
  escalation_packet_ref: string | null;
  scoring_mode: "enforce" | "shadow";
  created_at_iso: string;
}

export function buildArtifact(
  inputId: string,
  scoringMode: "enforce" | "shadow",
  regime: Regime,
): DecisionArtifact {
  const fixture = DECISION_INPUTS.find((d) => d.application_id === inputId) as DecisionInputWithVariants;
  const variant = fixture.regimeVariants[regime];
  const grr = variant.gateRunResult;
  // Strip the regimeVariants from the input snapshot (artifact captures the
  // applied input snapshot, not the precomputed alternatives).
  const inputSnapshot: DecisionInput = {
    application_id: fixture.application_id,
    founder_id: fixture.founder_id,
    requested_check_usd: fixture.requested_check_usd,
    domain_primary: fixture.domain_primary,
    domain_mix: fixture.domain_mix,
    coherence_superiority: fixture.coherence_superiority,
    coherence_superiority_ci95: fixture.coherence_superiority_ci95,
    transcript_quality_score: fixture.transcript_quality_score,
    transcript_quality_detail: fixture.transcript_quality_detail,
    anti_gaming_score: fixture.anti_gaming_score,
    compliance_status: fixture.compliance_status,
    portfolio_state: variant.portfolio_state,
    policy_version: fixture.policy_version,
  };
  const outcome = grr.overall === "pending" ? "pass" : (grr.overall as "pass" | "fail" | "manual_review");
  const failed: GateKey[] = grr.perGate.filter((g) => g.verdict === "fail" || g.verdict === "manual_review").map((g) => g.gate);
  const reasonCodes: string[] = grr.perGate.flatMap((g) => g.reasonCodes);
  return {
    schema_version: 1,
    policy_version: "decision-policy-v1.0.0",
    parameter_set_id: "params-v1",
    input: inputSnapshot,
    csReq: grr.csReq,
    csObserved: grr.csReq.csObserved,
    outcome,
    failed_gates: failed,
    reason_codes: reasonCodes,
    escalation_packet_ref: outcome === "pass" ? `esc-${inputId}` : null,
    scoring_mode: scoringMode,
    created_at_iso: "2026-04-18T10:14:22Z",
  };
}
