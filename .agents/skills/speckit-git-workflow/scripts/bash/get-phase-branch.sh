#!/usr/bin/env bash
# Compute per-phase git branch name: <feature-base>-<phase-lower>
# Usage: get-phase-branch.sh <PHASE_ID>
# Example: get-phase-branch.sh T003 → 001-local-todo-app-t003
set -euo pipefail

PHASE_ID="${1:-}"
[[ -n "$PHASE_ID" ]] || {
  echo "Usage: get-phase-branch.sh <PHASE_ID>" >&2
  exit 1
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CTX="$("$SCRIPT_DIR/get-feature-context.sh" --json)"

if command -v jq >/dev/null 2>&1; then
  BASE="$(echo "$CTX" | jq -r '.BRANCH_NAME')"
else
  BASE="$(echo "$CTX" | python3 -c "import json,sys; print(json.load(sys.stdin)['BRANCH_NAME'])")"
fi

phase_lower="$(echo "$PHASE_ID" | tr '[:upper:]' '[:lower:]')"
echo "${BASE}-${phase_lower}"
