#!/usr/bin/env bash
# One-shot sync: commit (if needed), push to mrquintin/personalwebsite, optional CI watch + smoke checks.
# Env: SYNC_FORCE, SYNC_SKIP_WATCH, SYNC_SKIP_VERIFY (skip npm verify:ci when deps files changed).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOPLEVEL=""
if TOPLEVEL="$(git -C "${SCRIPT_DIR}/.." rev-parse --show-toplevel 2>/dev/null)"; then
  cd "${TOPLEVEL}"
else
  cat >&2 <<'EOF'
error: this project folder is not a git repository (missing .git).

GitHub hosting the repo does not automatically create git metadata on disk. Initialize or clone first, for example:

  git clone https://github.com/mrquintin/personalwebsite.git

Or, in this project root:

  git init
  git branch -M main
  git remote add origin https://github.com/mrquintin/personalwebsite.git
  git fetch origin && git checkout -b main origin/main

Then run this script again.
EOF
  exit 1
fi

readonly REPO_SLUG="mrquintin/personalwebsite"
readonly REPO_PUSH_URL="https://github.com/${REPO_SLUG}.git"
readonly WORKFLOW_FILE="ci.yml"

remove_stale_git_lock() {
  local lock="$1"
  if [[ ! -e "$lock" ]]; then
    return 0
  fi
  if command -v lsof >/dev/null 2>&1; then
    if lsof "$lock" >/dev/null 2>&1; then
      echo "warning: active git lock (another process may be using it): ${lock}" >&2
      return 0
    fi
  fi
  echo "Removing stale git lock: ${lock}"
  rm -f "$lock"
}

clean_stale_git_locks() {
  remove_stale_git_lock ".git/index.lock"
  remove_stale_git_lock ".git/shallow.lock"
}

resolve_branch() {
  local b
  b="$(git symbolic-ref -q HEAD 2>/dev/null | sed 's|^refs/heads/||')" || true
  if [[ -z "${b:-}" ]]; then
    echo "error: detached HEAD detected. Check out a branch before syncing." >&2
    echo "hint: git checkout main" >&2
    exit 1
  fi
  echo "$b"
}

ensure_no_in_progress_rebase() {
  if [[ -d ".git/rebase-merge" || -d ".git/rebase-apply" ]]; then
    cat >&2 <<'EOF'
error: a git rebase is already in progress.

Finish it first:
  git rebase --continue

Or cancel it:
  git rebase --abort
EOF
    exit 1
  fi
}

working_tree_clean() {
  [[ -z "$(git status --porcelain --untracked-files=all 2>/dev/null)" ]]
}

commits_ahead_of_origin() {
  local branch="$1"
  if ! git rev-parse --verify "origin/${branch}" >/dev/null 2>&1; then
    echo "1"
    return 0
  fi
  git rev-list --count "origin/${branch}..HEAD" 2>/dev/null || echo "0"
}

commits_behind_origin() {
  local branch="$1"
  if ! git rev-parse --verify "origin/${branch}" >/dev/null 2>&1; then
    echo "0"
    return 0
  fi
  git rev-list --count "HEAD..origin/${branch}" 2>/dev/null || echo "0"
}

ensure_origin_remote() {
  if git remote get-url origin >/dev/null 2>&1; then
    return 0
  fi
  echo "Adding git remote origin -> ${REPO_PUSH_URL}" >&2
  git remote add origin "${REPO_PUSH_URL}"
}

print_pending_paths() {
  echo "Pending changes:"
  git status --short --untracked-files=all | awk '{ print substr($0, 4) }'
}

commit_if_needed() {
  git add -A
  if git diff --cached --quiet; then
    echo "No staged changes to commit."
    return 0
  fi
  git commit -m "Sync: latest changes"
}

ensure_no_merge_conflicts() {
  if [[ -n "$(git diff --name-only --diff-filter=U 2>/dev/null)" ]]; then
    cat >&2 <<'EOF'
error: unresolved merge conflicts detected.

Resolve conflicted files, then:
  git add <resolved-files>
  git commit

Then run this sync script again.
EOF
    exit 1
  fi
}

ensure_no_conflict_markers() {
  local matches
  matches="$(git grep -nE '^(<<<<<<< |>>>>>>> |=======)$' -- . ':(exclude)node_modules/*' 2>/dev/null || true)"
  if [[ -n "${matches}" ]]; then
    cat >&2 <<EOF
error: conflict markers found in tracked files:
${matches}

Resolve the markers, commit the fixes, then rerun sync.
EOF
    exit 1
  fi
}

curl_canonical_site() {
  local url="$1"
  local code
  code="$(curl -fsS --max-time 20 -o /dev/null -w "%{http_code}" -L "$url" || echo "000")"
  if [[ "$code" != "200" ]]; then
    echo "warning: canonical URL HTTP ${code} (expected 200): ${url}" >&2
    return 1
  fi
  echo "Canonical URL OK (HTTP 200): ${url}"
}

readme_canonical_url() {
  local readme="README.md"
  if [[ ! -f "$readme" ]]; then
    echo ""
    return 0
  fi
  local url
  url="$(grep -hoE 'https://[a-zA-Z0-9.-]+\.vercel\.app/?' "$readme" 2>/dev/null | head -1 || true)"
  if [[ -n "$url" ]]; then
    echo "$url"
    return 0
  fi
  url="$(grep -E '^\*\*Live site\*\*:|^\*\*Live\*\*:|^Canonical URL:|^Production:' "$readme" | grep -hoE 'https://[^)\s`>]+' | head -1 || true)"
  echo "$url"
}

check_deployments_for_sha() {
  local sha="$1"
  if ! command -v gh >/dev/null 2>&1; then
    return 0
  fi
  if ! gh auth status >/dev/null 2>&1; then
    return 0
  fi
  local dep_id
  dep_id="$(gh api "repos/${REPO_SLUG}/deployments?sha=${sha}&per_page=5" --jq '.[0].id // empty' 2>/dev/null || true)"
  if [[ -z "$dep_id" ]]; then
    echo "No GitHub deployments found yet for ${sha} (Vercel may still be registering)."
    return 0
  fi
  local bad
  bad="$(gh api "repos/${REPO_SLUG}/deployments/${dep_id}/statuses?per_page=10" --jq '[.[] | select(.state=="failure" or .state=="error")] | length' 2>/dev/null || echo "0")"
  if [[ "${bad:-0}" != "0" ]]; then
    echo "warning: GitHub deployment status reports failure/error for deployment ${dep_id}. Check Vercel/GitHub Deployments." >&2
    return 1
  fi
  echo "Latest GitHub deployment ${dep_id} has no failure/error status (or statuses not yet reported)."
}

outgoing_changed_files() {
  if git rev-parse --verify "origin/${branch}" >/dev/null 2>&1; then
    git diff --name-only "origin/${branch}"...HEAD
    return 0
  fi
  local root
  root="$(git rev-list --max-parents=0 HEAD 2>/dev/null | tail -1)"
  if [[ -n "$root" ]]; then
    git diff-tree --no-commit-id --name-only -r "${root}" HEAD
  else
    git diff-tree --no-commit-id --name-only -r HEAD
  fi
}

verify_ci_if_deps_changed() {
  if [[ "${SYNC_SKIP_VERIFY:-}" == "1" ]]; then
    echo "Skipping pre-push verify (SYNC_SKIP_VERIFY=1)."
    return 0
  fi
  if ! command -v npm >/dev/null 2>&1; then
    echo "warning: npm not found — skip verify:ci." >&2
    return 0
  fi
  if ! grep -q '"verify:ci"' package.json 2>/dev/null; then
    return 0
  fi
  local changed
  changed="$(outgoing_changed_files)"
  if ! echo "$changed" | grep -qE '^package\.json$|^package-lock\.json$'; then
    return 0
  fi
  echo "Dependency files changed in outgoing commits — running npm run verify:ci ..."
  npm run verify:ci
}

watch_ci_workflow() {
  local branch="$1"
  local sha="$2"
  if [[ "${SYNC_SKIP_WATCH:-}" == "1" ]]; then
    echo "Skipping CI watch (SYNC_SKIP_WATCH=1)."
    return 0
  fi
  if ! command -v gh >/dev/null 2>&1; then
    echo "gh CLI not installed; skip workflow watch."
    return 0
  fi
  if ! gh auth status >/dev/null 2>&1; then
    echo "gh not authenticated; skip workflow watch."
    return 0
  fi
  echo "Waiting for workflow run (${WORKFLOW_FILE}) for ${sha}..."
  local run_id=""
  local i
  for i in $(seq 1 45); do
    run_id="$(
      gh run list --repo "${REPO_SLUG}" --workflow="${WORKFLOW_FILE}" --branch "${branch}" --limit 10 --json databaseId,headSha,status \
        -q ".[] | select(.headSha==\"${sha}\") | .databaseId" 2>/dev/null | head -1
    )"
    if [[ -n "$run_id" ]]; then
      break
    fi
    sleep 2
  done
  if [[ -z "$run_id" ]]; then
    echo "warning: could not find a CI run for this push (check Actions on GitHub)." >&2
    return 0
  fi
  gh run watch "${run_id}" --repo "${REPO_SLUG}" --exit-status && echo "CI run ${run_id} completed successfully."
}

rebase_onto_origin_if_needed() {
  local branch="$1"
  local behind
  behind="$(commits_behind_origin "$branch")"
  if [[ "${behind}" == "0" ]]; then
    return 0
  fi

  echo "Local ${branch} is behind origin/${branch} by ${behind} commit(s) — rebasing before push..."
  if ! git rebase "origin/${branch}"; then
    echo "Rebase failed — aborting rebase and falling back to merge strategy..." >&2
    git rebase --abort >/dev/null 2>&1 || true
    if ! git merge --no-edit "origin/${branch}"; then
      cat >&2 <<EOF
error: both rebase and merge failed.

Resolve merge conflicts, then continue:
  git add <resolved-files>
  git commit

Then rerun this sync script.
EOF
      exit 1
    fi
  fi
}

main() {
  clean_stale_git_locks
  ensure_no_in_progress_rebase
  ensure_no_merge_conflicts
  ensure_no_conflict_markers
  ensure_origin_remote

  branch="$(resolve_branch)"

  git fetch origin "${branch}" 2>/dev/null || git fetch origin 2>/dev/null || true

  local ahead
  ahead="$(commits_ahead_of_origin "$branch")"

  if working_tree_clean && [[ "${ahead}" == "0" ]]; then
    if [[ "${SYNC_FORCE:-}" == "1" ]]; then
      echo "Working tree clean and not ahead of origin/${branch}; SYNC_FORCE=1 — continuing."
    elif [[ -t 0 && -t 1 ]]; then
      read -r -p "Already up to date with origin/${branch}. Push anyway? [y/N] " ans
      case "${ans:-}" in
        y | Y) ;;
        *)
          echo "Nothing to do."
          exit 0
          ;;
      esac
    else
      echo "Already up to date with origin/${branch}. Nothing to push. Set SYNC_FORCE=1 to push anyway." >&2
      exit 0
    fi
  fi

  if ! working_tree_clean; then
    print_pending_paths
    commit_if_needed
  fi

  # Keep branch linear when possible; fall back to merge when required.
  git fetch origin "${branch}" 2>/dev/null || git fetch origin 2>/dev/null || true
  rebase_onto_origin_if_needed "${branch}"

  ahead="$(commits_ahead_of_origin "$branch")"
  if [[ "$ahead" == "0" ]] && working_tree_clean; then
    echo "No commits to push."
    exit 0
  fi

  ensure_no_merge_conflicts
  ensure_no_conflict_markers
  verify_ci_if_deps_changed

  echo "Pushing to origin ${branch} (${REPO_PUSH_URL})..."
  git push origin "${branch}"

  local head_sha
  head_sha="$(git rev-parse HEAD)"

  local canon
  canon="$(readme_canonical_url)"
  if [[ -n "$canon" ]]; then
    curl_canonical_site "$canon" || true
  else
    echo "No https://*.vercel.app (or tagged Live URL) found in README.md — skip canonical curl."
  fi

  check_deployments_for_sha "$head_sha" || true

  watch_ci_workflow "$branch" "$head_sha" || true
}

main "$@"
