#!/usr/bin/env bash
# Read local git user.name and user.email for commit author confirmation.
# Usage: get-git-identity.sh [--json]
set -euo pipefail

JSON_MODE=false
[[ "${1:-}" == "--json" ]] && JSON_MODE=true

GIT_NAME="$(git config --get user.name 2>/dev/null || true)"
GIT_EMAIL="$(git config --get user.email 2>/dev/null || true)"

if $JSON_MODE; then
  if command -v jq >/dev/null 2>&1; then
    jq -n --arg name "$GIT_NAME" --arg email "$GIT_EMAIL" '{name:$name,email:$email}'
  else
    printf '{"name":"%s","email":"%s"}\n' "$GIT_NAME" "$GIT_EMAIL"
  fi
else
  echo "GIT_USER_NAME: ${GIT_NAME:-<not set>}"
  echo "GIT_USER_EMAIL: ${GIT_EMAIL:-<not set>}"
fi

if [[ -z "$GIT_NAME" || -z "$GIT_EMAIL" ]]; then
  echo "WARNING: git user.name or user.email is not configured." >&2
  exit 1
fi
