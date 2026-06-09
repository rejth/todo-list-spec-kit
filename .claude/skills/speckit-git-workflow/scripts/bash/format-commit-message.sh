#!/usr/bin/env bash
# Build a Conventional Commits message for a Spec Kit phase.
# Usage: format-commit-message.sh <PHASE_ID> "<PHASE_TITLE>"
# Example: format-commit-message.sh T001 "Phase 1: Setup — Initialize Vite"
set -euo pipefail

PHASE_ID="${1:-}"
PHASE_TITLE="${2:-}"

[[ -n "$PHASE_ID" && -n "$PHASE_TITLE" ]] || {
  echo "Usage: format-commit-message.sh <PHASE_ID> \"<PHASE_TITLE>\"" >&2
  exit 1
}

phase_lower="$(echo "$PHASE_ID" | tr '[:upper:]' '[:lower:]')"

# Infer commit type from phase title keywords (see REFERENCE.md)
commit_type="feat"
if echo "$PHASE_TITLE" | grep -qiE 'setup|initialize|scaffold'; then
  commit_type="chore"
elif echo "$PHASE_TITLE" | grep -qiE 'polish|accessibility|validation'; then
  commit_type="chore"
elif echo "$PHASE_TITLE" | grep -qiE 'fix|bug'; then
  commit_type="fix"
elif echo "$PHASE_TITLE" | grep -qiE 'refactor'; then
  commit_type="refactor"
elif echo "$PHASE_TITLE" | grep -qiE 'test'; then
  commit_type="test"
fi

# Short description: strip markdown bold, take first clause before em dash
clean_title="$(echo "$PHASE_TITLE" | sed -E 's/\*\*//g')"
short_desc="$(echo "$clean_title" | sed -E 's/^Phase [0-9]+: //; s/ —.*$//; s/ -.*$//')"
short_desc="$(echo "$short_desc" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/ /g; s/^ +| +$//g; s/ /-/g')"

# Conventional Commits: type(scope): description
# https://www.conventionalcommits.org/en/v1.0.0/
echo "${commit_type}(${phase_lower}): ${short_desc}"
