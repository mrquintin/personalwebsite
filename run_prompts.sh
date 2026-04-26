#!/usr/bin/env bash
# run_prompts.sh
# ------------------------------------------------------------------
# Batch driver for the "Prompts for improvement" suite.
#
# Each prompt is a SEPARATE, fresh, headless `claude -p` invocation.
# Prompts are never concatenated. They run strictly in filename order,
# one at a time, from the project root with --dangerously-skip-permissions
# and --output-format stream-json so the user sees live progress in
# their terminal. Each run's output is logged to .prompt_run_logs/.
#
# Billing: the script unsets ANTHROPIC_API_KEY and ANTHROPIC_AUTH_TOKEN
# so claude routes to the user's Max subscription, NOT API credits.
# Prereq: `claude /login` once before the first run.
#
# Usage:
#   chmod +x run_prompts.sh
#   ./run_prompts.sh
# ------------------------------------------------------------------

set -u  # fail on undefined vars; do NOT set -e (we continue on prompt failure)

# ---- Billing safety ---------------------------------------------
# If either of these is set, `claude` will bill as API usage, not Max.
unset ANTHROPIC_API_KEY
unset ANTHROPIC_AUTH_TOKEN

# ---- Config -----------------------------------------------------
PROJECT_ROOT="/Users/michaelquintin/Desktop/Main Desktop - Michael's MacBook Pro/Projects/Personal_Website"
PROMPTS_ROOT="$PROJECT_ROOT/Prompts for improvement"
LOG_ROOT="$PROJECT_ROOT/.prompt_run_logs/$(date +%Y%m%d_%H%M%S)"

# Current run: implement suites 12-22 (the v2 overhaul, 70 prompts).
# All prior suites have been moved to
# ../_archive_prompts_pre_overhaul_2026-04-25/. AUDIT_START is set
# equal to IMPL_START so the audit range is empty; every prompt runs
# in implementation-only mode.
AUDIT_START_FOLDER="12_Foundation_And_Audit"
AUDIT_START_FILE="P01_audit_unusability.txt"
IMPL_START_FOLDER="12_Foundation_And_Audit"
IMPL_START_FILE="P01_audit_unusability.txt"

# ---- Timeout config --------------------------------------------
# Hard per-prompt timeout. If a single `claude` run exceeds this, the
# prompt is killed and the pipeline continues to the next prompt.
AUDIT_TIMEOUT="45m"
IMPL_TIMEOUT="90m"
TIMEOUT_CMD=""
if command -v gtimeout >/dev/null 2>&1; then
  TIMEOUT_CMD="gtimeout"
elif command -v timeout >/dev/null 2>&1; then
  TIMEOUT_CMD="timeout"
fi

# Claude Code CLI flags.
#   -p                            headless / non-interactive
#   --dangerously-skip-permissions   no interactive approvals
#   --output-format stream-json   emit NDJSON events as they happen
#                                 so output streams live (text alone
#                                 buffers until completion in -p mode)
#   --verbose                     required by stream-json
#   --model                       force claude-opus-4-7 for both
#                                 auditing and implementation
CLAUDE_FLAGS=(
  -p
  --dangerously-skip-permissions
  --output-format stream-json
  --verbose
  --model claude-opus-4-7
)

# ---- Pre-flight -------------------------------------------------
if ! command -v claude >/dev/null 2>&1; then
  echo "ERROR: \`claude\` CLI not found in PATH. Install Claude Code and re-run."
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 not found in PATH. Required for live stream rendering."
  exit 1
fi

echo "=== pre-flight ==="
echo "claude CLI: $(claude --version 2>&1 | head -1)"
echo "python3:    $(python3 --version 2>&1 | head -1)"
echo "model:      claude-opus-4-7 (forced via --model for all runs)"
echo ""

if [ ! -d "$PROJECT_ROOT" ]; then
  echo "ERROR: project root not found: $PROJECT_ROOT"
  exit 1
fi

if [ ! -d "$PROMPTS_ROOT" ]; then
  echo "ERROR: prompts folder not found: $PROMPTS_ROOT"
  exit 1
fi

mkdir -p "$LOG_ROOT"
cd "$PROJECT_ROOT" || { echo "ERROR: cannot cd to $PROJECT_ROOT"; exit 1; }

# ---- Live stream renderer ---------------------------------------
# Claude Code's --output-format stream-json emits one JSON event per
# line. This Python helper reads that stream and renders each event
# as a human-readable line as soon as it arrives. The -u flag on
# python3 (passed below) ensures stdout is unbuffered.
RENDERER="$PROJECT_ROOT/.prompt_run_logs/render_stream.py"
mkdir -p "$(dirname "$RENDERER")"
cat > "$RENDERER" <<'PYEOF'
#!/usr/bin/env python3
"""Render Claude Code stream-json NDJSON as live, human-readable lines."""
import sys, json

def p(s):
    sys.stdout.write(s)
    sys.stdout.flush()

def render_block(block):
    if not isinstance(block, dict):
        return
    t = block.get("type")
    if t == "text":
        p(block.get("text", ""))
    elif t == "tool_use":
        name = block.get("name", "?")
        inp = block.get("input", {}) or {}
        summary = ""
        if isinstance(inp, dict):
            for key in ("file_path", "path", "command", "pattern",
                        "url", "description", "query", "old_string"):
                if key in inp:
                    val = str(inp[key]).replace("\n", " ")
                    summary = val[:160]
                    break
        p("\n\n[TOOL " + str(name) + "] " + summary + "\n")
    elif t == "tool_result":
        content = block.get("content", "")
        if isinstance(content, list):
            for c in content:
                if isinstance(c, dict) and c.get("type") == "text":
                    txt = c.get("text", "")
                    snippet = txt[:200].replace("\n", " ")
                    suffix = " ..." if len(txt) > 200 else ""
                    p("  [result: " + snippet + suffix + "]\n")
        elif isinstance(content, str):
            snippet = content[:200].replace("\n", " ")
            suffix = " ..." if len(content) > 200 else ""
            p("  [result: " + snippet + suffix + "]\n")

for raw in sys.stdin:
    raw = raw.rstrip("\n")
    if not raw:
        continue
    try:
        ev = json.loads(raw)
    except Exception:
        p(raw + "\n")
        continue
    try:
        t = ev.get("type", "")
        if t == "system":
            sub = ev.get("subtype", "")
            if sub == "init":
                model = ev.get("model", "?")
                session = ev.get("session_id", "?")
                p("[session started model=" + str(model) +
                  " session=" + str(session)[:8] + "]\n")
            else:
                p("[system:" + str(sub) + "]\n")
        elif t == "assistant":
            msg = ev.get("message", {}) or {}
            content = msg.get("content", [])
            if isinstance(content, list):
                for b in content:
                    render_block(b)
            else:
                p(str(content))
        elif t == "user":
            msg = ev.get("message", {}) or {}
            content = msg.get("content", [])
            if isinstance(content, list):
                for b in content:
                    render_block(b)
        elif t == "result":
            cost = ev.get("total_cost_usd", "?")
            dur = ev.get("duration_ms", "?")
            turns = ev.get("num_turns", "?")
            p("\n\n[completed: cost=$" + str(cost) +
              " duration=" + str(dur) + "ms turns=" + str(turns) + "]\n")
        else:
            p("\n[" + str(t) + "]\n")
    except Exception as e:
        p("[render-error: " + str(e) + "] " + raw[:200] + "\n")
PYEOF
chmod +x "$RENDERER"

SUMMARY_FILE="$LOG_ROOT/SUMMARY.txt"
: > "$SUMMARY_FILE"

# ---- Partition folders (dynamic) --------------------------------
# Three-way split in sort order at the two boundaries.
#   < AUDIT_START_FOLDER  -> SKIP
#   [AUDIT_START, IMPL_START)  -> AUDIT + fallback
#   >= IMPL_START_FOLDER  -> IMPLEMENT only
SKIP_FOLDERS=()
AUDIT_FOLDERS=()
IMPL_FOLDERS=()
past_audit_start=0
past_impl_start=0
while IFS= read -r -d '' dir; do
  folder="$(basename "$dir")"
  if [ "$folder" = "$AUDIT_START_FOLDER" ]; then
    past_audit_start=1
  fi
  if [ "$folder" = "$IMPL_START_FOLDER" ]; then
    past_impl_start=1
  fi
  if [ $past_impl_start -eq 1 ]; then
    IMPL_FOLDERS+=("$folder")
  elif [ $past_audit_start -eq 1 ]; then
    AUDIT_FOLDERS+=("$folder")
  else
    SKIP_FOLDERS+=("$folder")
  fi
done < <(find "$PROMPTS_ROOT" -maxdepth 1 -mindepth 1 -type d -print0 | sort -z)

if [ ${#AUDIT_FOLDERS[@]} -eq 0 ] && [ ${#IMPL_FOLDERS[@]} -eq 0 ]; then
  echo "ERROR: no audit or impl folders matched the boundary variables."
  echo "       AUDIT_START_FOLDER=$AUDIT_START_FOLDER"
  echo "       IMPL_START_FOLDER=$IMPL_START_FOLDER"
  echo "       Folders found under $PROMPTS_ROOT:"
  for f in "${SKIP_FOLDERS[@]}"; do echo "         $f"; done
  exit 1
fi

log_summary() {
  printf '%s\n' "$*" | tee -a "$SUMMARY_FILE"
}

# ---- Wrappers ---------------------------------------------------
read -r -d '' AUDIT_WRAPPER <<'EOF' || true
AUDIT MODE -- EXHAUSTIVE VERIFICATION, DO NOT RE-IMPLEMENT FROM SCRATCH.

The prompt below was previously submitted to Claude Code. Your job now is
to verify it was actually implemented in the current repo, and fix only
the gaps you find. Re-implementing already-passing work wastes the user's
subscription quota and risks regressions.

Procedure:
  1. Read the prompt in full. Enumerate every discrete acceptance check
     it declares (the §B clauses) as a checklist.
  2. For each row, inspect the current repo state and mark PASS or FAIL
     with one-sentence evidence (file path + line number, test command +
     outcome).
  3. If any row fails, implement ONLY the delta needed to close the gap.
  4. End with the machine-parseable line:
       AUDIT_RESULT: PASS
       AUDIT_RESULT: FAIL (gaps closed by this audit)
       AUDIT_RESULT: FAIL (gaps remain)
       AUDIT_RESULT: FAIL (not implemented)

--- ORIGINAL PROMPT FOLLOWS ---

EOF

read -r -d '' IMPL_WRAPPER <<'EOF' || true
IMPLEMENT MODE.

Execute the prompt below in full. Create every file, test, script, and
fixture it specifies. Run the acceptance checks it declares. Report
results honestly -- if something fails, say so; do not fake PASS.

End your response with a machine-parseable line on its own line:
    IMPL_RESULT: PASS
 or IMPL_RESULT: FAIL (reasons above)

--- PROMPT FOLLOWS ---

EOF

# ---- Run one prompt ---------------------------------------------
# $1 = mode ("audit" | "impl")
# $2 = absolute path to prompt file
run_prompt() {
  local mode="$1"
  local prompt_file="$2"
  local basename
  basename="$(basename "$prompt_file" .txt)"
  local folder_name
  folder_name="$(basename "$(dirname "$prompt_file")")"
  local log_file="$LOG_ROOT/${folder_name}__${basename}.${mode}.log"

  local wrapper
  if [ "$mode" = "audit" ]; then
    wrapper="$AUDIT_WRAPPER"
  else
    wrapper="$IMPL_WRAPPER"
  fi

  log_summary ""
  log_summary "================================================================"
  log_summary ">>> [$mode] $folder_name / $basename"
  log_summary ">>> START: $(date -Iseconds 2>/dev/null || date)"
  log_summary ">>> LOG:   $log_file"
  log_summary ">>> --- live Claude Code output below ---"
  log_summary "================================================================"

  # Per-mode hard timeout.
  local this_timeout
  if [ "$mode" = "audit" ]; then
    this_timeout="$AUDIT_TIMEOUT"
  else
    this_timeout="$IMPL_TIMEOUT"
  fi
  # Build a timeout-command prefix. If no timeout binary was found at
  # pre-flight, the prefix is empty and `claude` runs without a hard
  # limit (with a warning logged at startup).
  local claude_prefix=()
  if [ -n "$TIMEOUT_CMD" ]; then
    # --kill-after=60s upgrades the SIGTERM to SIGKILL if claude is
    # still alive 60s after the initial expiry.
    claude_prefix=("$TIMEOUT_CMD" --kill-after=60s "$this_timeout")
  fi

  local raw_log="$LOG_ROOT/${folder_name}__${basename}.${mode}.ndjson"
  # The ${arr[@]+"${arr[@]}"} idiom is required under `set -u` on
  # bash 3.2 (macOS default) — expanding an empty array with
  # plain "${arr[@]}" throws "unbound variable" there.
  {
    printf '%s' "$wrapper"
    cat "$prompt_file"
  } | ${claude_prefix[@]+"${claude_prefix[@]}"} claude "${CLAUDE_FLAGS[@]}" 2>&1 \
    | tee "$raw_log" \
    | python3 -u "$RENDERER" \
    | tee "$log_file"
  # Pipeline positions:
  #   [0] = { ...; } prompt source
  #   [1] = (timeout) claude
  #   [2] = tee raw
  #   [3] = python3 renderer
  #   [4] = tee rendered
  local rc="${PIPESTATUS[1]}"
  # rc 124 = timeout expired; 137 = killed by --kill-after SIGKILL.
  if [ "$rc" = "124" ] || [ "$rc" = "137" ]; then
    log_summary "  TIMEOUT: claude exceeded $this_timeout for this prompt (rc=$rc); moving on"
  fi

  log_summary "================================================================"
  log_summary "<<< [$mode] $folder_name / $basename"
  log_summary "<<< END: $(date -Iseconds 2>/dev/null || date) (exit=$rc)"

  local result_line
  result_line="$(grep -E '^(AUDIT_RESULT|IMPL_RESULT):' "$log_file" | tail -1 || true)"
  if [ -n "$result_line" ]; then
    log_summary "RESULT: $result_line"
  else
    log_summary "RESULT: (no machine-parseable result line -- inspect log)"
  fi

  return $rc
}

# ---- Audit-with-fallback ----------------------------------------
audit_with_fallback() {
  local prompt_file="$1"
  local basename
  basename="$(basename "$prompt_file" .txt)"
  local folder_name
  folder_name="$(basename "$(dirname "$prompt_file")")"
  local audit_log="$LOG_ROOT/${folder_name}__${basename}.audit.log"

  run_prompt "audit" "$prompt_file"
  local audit_rc=$?

  local needs_impl=0
  local reason=""

  if [ $audit_rc -ne 0 ]; then
    needs_impl=1
    reason="audit exited $audit_rc"
  else
    local result_line
    result_line="$(grep -E '^AUDIT_RESULT:' "$audit_log" 2>/dev/null | tail -1 || true)"
    if [ -z "$result_line" ]; then
      needs_impl=1
      reason="no AUDIT_RESULT line in audit log"
    elif echo "$result_line" | grep -qi "gaps remain"; then
      needs_impl=1
      reason="audit reported unresolved gaps"
    elif echo "$result_line" | grep -qi "not implemented"; then
      needs_impl=1
      reason="audit reported prompt was not implemented"
    fi
  fi

  if [ $needs_impl -eq 1 ]; then
    log_summary "  FALLBACK: $reason"
    log_summary "  Running full implementation pass for this prompt."
    run_prompt "impl" "$prompt_file"
  fi
}

# ---- Main -------------------------------------------------------
log_summary "================================================================"
log_summary "Prompt batch run"
log_summary "Started: $(date -Iseconds 2>/dev/null || date)"
log_summary "Project: $PROJECT_ROOT"
log_summary "Logs:    $LOG_ROOT"
log_summary "Boundaries:"
log_summary "  AUDIT starts at:  $AUDIT_START_FOLDER / $AUDIT_START_FILE"
log_summary "                    (everything sorting before this point is SKIPPED)"
log_summary "  IMPL  starts at:  $IMPL_START_FOLDER / $IMPL_START_FILE"
log_summary "                    (this file and everything after are IMPL only)"
if [ -n "$TIMEOUT_CMD" ]; then
  log_summary "Timeouts (hard per-prompt):"
  log_summary "  AUDIT: $AUDIT_TIMEOUT   IMPL: $IMPL_TIMEOUT   via: $TIMEOUT_CMD --kill-after=60s"
else
  log_summary "Timeouts: DISABLED (neither gtimeout nor timeout found on PATH)"
fi
log_summary "----------------------------------------------------------------"
log_summary "SKIPPED folders (before $AUDIT_START_FOLDER):"
if [ ${#SKIP_FOLDERS[@]} -eq 0 ]; then
  log_summary "    (none)"
else
  for f in "${SKIP_FOLDERS[@]}"; do log_summary "    $f"; done
fi
log_summary "AUDIT + fallback folders (in order):"
if [ ${#AUDIT_FOLDERS[@]} -eq 0 ]; then
  log_summary "    (none)"
else
  for f in "${AUDIT_FOLDERS[@]}"; do log_summary "    $f"; done
fi
log_summary "IMPLEMENT folders (in order):"
if [ ${#IMPL_FOLDERS[@]} -eq 0 ]; then
  log_summary "    (none)"
else
  for f in "${IMPL_FOLDERS[@]}"; do log_summary "    $f"; done
fi
log_summary "================================================================"

# PHASE 1 -- audit folders. Bash 3.2 + set -u: empty-array expansion
# trap; the ${arr[@]+"${arr[@]}"} idiom expands to nothing when empty.
for folder in ${AUDIT_FOLDERS[@]+"${AUDIT_FOLDERS[@]}"}; do
  log_summary ""
  log_summary "################################################################"
  log_summary "# PHASE 1 (AUDIT): $folder"
  log_summary "################################################################"
  if [ ! -d "$PROMPTS_ROOT/$folder" ]; then
    log_summary "  WARN: folder not found -- skipping"
    continue
  fi
  while IFS= read -r -d '' prompt_file; do
    pf_base="$(basename "$prompt_file")"
    if [ "$folder" = "$AUDIT_START_FOLDER" ] && [[ "$pf_base" < "$AUDIT_START_FILE" ]]; then
      log_summary "  SKIP (before audit-start cutoff): $pf_base"
      continue
    fi
    audit_with_fallback "$prompt_file"
  done < <(find "$PROMPTS_ROOT/$folder" -maxdepth 1 -type f -name '*.txt' ! -name '00_*' -print0 | sort -z)
done

# PHASE 2 -- impl folders. Same bash 3.2 protection.
for folder in ${IMPL_FOLDERS[@]+"${IMPL_FOLDERS[@]}"}; do
  log_summary ""
  log_summary "################################################################"
  log_summary "# PHASE 2 (IMPLEMENT): $folder"
  log_summary "################################################################"
  if [ ! -d "$PROMPTS_ROOT/$folder" ]; then
    log_summary "  WARN: folder not found -- skipping"
    continue
  fi
  while IFS= read -r -d '' prompt_file; do
    pf_base="$(basename "$prompt_file")"
    if [ "$folder" = "$IMPL_START_FOLDER" ] && [[ "$pf_base" < "$IMPL_START_FILE" ]]; then
      log_summary "  SKIP (before impl-start cutoff): $pf_base"
      continue
    fi
    if ! run_prompt "impl" "$prompt_file"; then
      log_summary "  NOTE: non-zero exit -- continuing to next prompt"
    fi
  done < <(find "$PROMPTS_ROOT/$folder" -maxdepth 1 -type f -name '*.txt' ! -name '00_*' -print0 | sort -z)
done

log_summary ""
log_summary "================================================================"
log_summary "DONE"
log_summary "Ended: $(date -Iseconds 2>/dev/null || date)"
log_summary "Summary: $SUMMARY_FILE"
log_summary "================================================================"
