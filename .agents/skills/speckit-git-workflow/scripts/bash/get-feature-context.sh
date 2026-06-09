#!/usr/bin/env bash
# Resolve Spec Kit feature paths and suggested git branch name from feature.json.
# Usage: get-feature-context.sh [--json]
set -euo pipefail

JSON_MODE=false
[[ "${1:-}" == "--json" ]] && JSON_MODE=true

find_specify_root() {
  local dir
  dir="$(cd "$(pwd)" && pwd)"
  while [[ "$dir" != "/" ]]; do
    [[ -d "$dir/.specify" ]] && { echo "$dir"; return 0; }
    dir="$(dirname "$dir")"
  done
  return 1
}

REPO_ROOT="$(find_specify_root)" || {
  echo "ERROR: No .specify directory found. Run from a Spec Kit project root." >&2
  exit 1
}

FEATURE_JSON="$REPO_ROOT/.specify/feature.json"
[[ -f "$FEATURE_JSON" ]] || {
  echo "ERROR: $FEATURE_JSON not found. Run /speckit-specify first." >&2
  exit 1
}

read_feature_directory() {
  local fj="$1"
  if command -v jq >/dev/null 2>&1; then
    jq -r '.feature_directory // empty' "$fj"
  elif command -v python3 >/dev/null 2>&1; then
    python3 -c "import json,sys; d=json.load(open(sys.argv[1])); print(d.get('feature_directory') or '')" "$fj"
  else
    grep -E '"feature_directory"' "$fj" | head -1 | sed -E 's/.*"feature_directory"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/'
  fi
}

FEATURE_DIR_REL="$(read_feature_directory "$FEATURE_JSON")"
[[ -n "$FEATURE_DIR_REL" ]] || {
  echo "ERROR: feature_directory missing in $FEATURE_JSON" >&2
  exit 1
}

FEATURE_DIR="$REPO_ROOT/$FEATURE_DIR_REL"
TASKS_FILE="$FEATURE_DIR/tasks.md"
BRANCH_NAME="$(basename "$FEATURE_DIR_REL")"

[[ -f "$TASKS_FILE" ]] || {
  echo "ERROR: $TASKS_FILE not found. Run /speckit-tasks first." >&2
  exit 1
}

if $JSON_MODE; then
  if command -v jq >/dev/null 2>&1; then
    jq -n \
      --arg repo_root "$REPO_ROOT" \
      --arg feature_dir "$FEATURE_DIR" \
      --arg feature_dir_rel "$FEATURE_DIR_REL" \
      --arg tasks_file "$TASKS_FILE" \
      --arg branch_name "$BRANCH_NAME" \
      '{REPO_ROOT:$repo_root,FEATURE_DIR:$feature_dir,FEATURE_DIR_REL:$feature_dir_rel,TASKS_FILE:$tasks_file,BRANCH_NAME:$branch_name}'
  else
    printf '{"REPO_ROOT":"%s","FEATURE_DIR":"%s","FEATURE_DIR_REL":"%s","TASKS_FILE":"%s","BRANCH_NAME":"%s"}\n' \
      "$REPO_ROOT" "$FEATURE_DIR" "$FEATURE_DIR_REL" "$TASKS_FILE" "$BRANCH_NAME"
  fi
else
  echo "REPO_ROOT: $REPO_ROOT"
  echo "FEATURE_DIR: $FEATURE_DIR"
  echo "FEATURE_DIR_REL: $FEATURE_DIR_REL"
  echo "TASKS_FILE: $TASKS_FILE"
  echo "BRANCH_NAME: $BRANCH_NAME"
fi
