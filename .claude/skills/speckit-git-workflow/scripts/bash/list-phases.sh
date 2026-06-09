#!/usr/bin/env bash
# List top-level T00N phases from tasks.md (Spec Kit phase tasks only).
# Usage: list-phases.sh [--json] [tasks_file]
set -euo pipefail

JSON_MODE=false
TASKS_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --json) JSON_MODE=true; shift ;;
    *) TASKS_FILE="$1"; shift ;;
  esac
done

if [[ -z "$TASKS_FILE" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  CTX="$("$SCRIPT_DIR/get-feature-context.sh" --json)"
  if command -v jq >/dev/null 2>&1; then
    TASKS_FILE="$(echo "$CTX" | jq -r '.TASKS_FILE')"
  else
    TASKS_FILE="$(echo "$CTX" | python3 -c "import json,sys; print(json.load(sys.stdin)['TASKS_FILE'])")"
  fi
fi

[[ -f "$TASKS_FILE" ]] || {
  echo "ERROR: tasks file not found: $TASKS_FILE" >&2
  exit 1
}

# Match: - [ ] T001 **Phase 1: ...** or - [x] T001 ...
phases=()
while IFS= read -r line; do
  phases+=("$line")
done < <(grep -E '^- \[[ xX]\] T[0-9]{3} ' "$TASKS_FILE" || true)

# Strip trailing "(issue #N)" from title; extract issue number when present.
parse_phase_line() {
  local line="$1"
  local done_flag id rest title issue=""

  if [[ "$line" =~ ^-\ \[(.)\]\ (T[0-9]{3})\ (.+)$ ]]; then
    done_flag="${BASH_REMATCH[1]}"
    id="${BASH_REMATCH[2]}"
    rest="${BASH_REMATCH[3]}"
    if [[ "$rest" =~ ^(.+)[[:space:]]+\(issue[[:space:]]#([0-9]+)\)[[:space:]]*$ ]]; then
      title="${BASH_REMATCH[1]}"
      issue="${BASH_REMATCH[2]}"
    else
      title="$rest"
    fi
    echo "$done_flag|$id|$title|$issue"
  fi
}

if $JSON_MODE; then
  if command -v jq >/dev/null 2>&1; then
    printf '%s\n' "${phases[@]}" | jq -R -s 'split("\n") | map(select(length > 0)) | map(
      capture("^- \\[(?<done>[ xX])\\] (?<id>T[0-9]{3}) (?<title>.+?)(?: \\((?<issue_label>issue) #(?<issue>[0-9]+)\\))?$") |
      {id: .id, done: (.done | ascii_downcase == "x"), title: .title, issue: (if .issue then (.issue | tonumber) else null end)}
    )'
  else
    echo '['
    first=true
    for line in "${phases[@]}"; do
      parsed="$(parse_phase_line "$line")"
      [[ -n "$parsed" ]] || continue
      IFS='|' read -r done_flag id title issue <<< "$parsed"
      is_done="false"
      [[ "$done_flag" == "x" || "$done_flag" == "X" ]] && is_done="true"
      $first || echo ','
      first=false
      if [[ -n "$issue" ]]; then
        printf '  {"id":"%s","done":%s,"title":%q,"issue":%s}' "$id" "$is_done" "$title" "$issue"
      else
        printf '  {"id":"%s","done":%s,"title":%q,"issue":null}' "$id" "$is_done" "$title"
      fi
    done
    echo ''
    echo ']'
  fi
else
  for line in "${phases[@]}"; do
    echo "$line"
  done
fi
