---
name: speckit-git-workflow
description: Full Spec Kit implement-plus-git orchestrator — prerequisites, context, checklists, single T00N phase implementation (speckit-implement core), then branch, Conventional Commit, and PR per phase with human gates. Use for /speckit-implement with git discipline, commit-per-phase, PR-per-phase, or /speckit-git-workflow.
user-invocable: true
compatibility: Requires Spec Kit (.specify/), tasks.md with T00N phases and (issue #N), GitHub remote, and gh CLI.
---

# Spec Kit Git Workflow

**Full implement + git** for one T00N phase per run. Includes all `/speckit-implement` context/requirements steps via [IMPLEMENT-CORE.md](IMPLEMENT-CORE.md).

Scripts: `scripts/bash/` beside this skill (`.claude/skills/`, `.agents/skills/`, or `~/.claude/skills/`).

## Invoke

```text
/speckit-git-workflow
/speckit-git-workflow T003
/speckit-implement          → redirects here by default (see speckit-implement skill)
```

## Hard rules

1. **One phase per run** — stop after PR; next phase only when human explicitly approves.
2. **Implement core first** — complete [IMPLEMENT-CORE.md](IMPLEMENT-CORE.md) before any commit.
3. **Never commit without confirmation** — show identity, `git diff --stat`, message; wait for **yes**.
4. **New branch per phase** — `{feature-base}-t00n` via `get-phase-branch.sh`.
5. **Stage all** — `git add -A`.
6. **Issue from tasks.md** — `(issue #N)` on phase line; abort if missing.

## Workflow overview

```text
[A] IMPLEMENT-CORE (prereqs → context → ignore files → one phase → validate)
[B] Git: phase branch from default
[C] Git: confirm → commit → PR
[D] Stop — wait for human
```

---

## Phase A — Implementation (IMPLEMENT-CORE)

**Read and execute** [IMPLEMENT-CORE.md](IMPLEMENT-CORE.md) in full.

Summary:

1. `before_implement` hooks (if any)
2. `check-prerequisites.sh --json --require-tasks --include-tasks`
3. Checklists gate (`FEATURE_DIR/checklists/`)
4. Load `tasks.md`, `plan.md`, `spec.md`, contracts, constitution, quickstart
5. Verify/create ignore files
6. Parse **target T00N** from `list-phases.sh --json` (user arg or first `done: false`)
7. Implement that phase only (TDD, checkpoints, mark `[x]` in `tasks.md`)
8. Phase validation + `after_implement` hooks

**Do not commit** until Phase A validation passes.

---

## Phase B — Git branch (before coding, if not already on branch)

Run **before** step 7 if starting fresh; if resuming mid-phase, ensure correct branch:

```bash
get-feature-context.sh --json
get-phase-branch.sh T00N
git fetch origin
DEFAULT=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo main)
git checkout "$DEFAULT" && git pull --rebase origin "$DEFAULT"
git checkout -B <phase-branch>
```

Verify `git remote get-url origin` is the intended GitHub repo.

**Recommended order**: B → A (branch first, then implement on that branch). On first run of a phase, create branch then execute IMPLEMENT-CORE.

---

## Phase C — Commit and PR

### Confirm (mandatory)

```bash
get-git-identity.sh --json
git status && git diff --stat
format-commit-message.sh T00N "<title>"
```

Ask: **"Commit all changes with this author and message? (yes/no)"**

### Commit

```bash
git add -A
git commit -m "$(cat <<EOF
<subject from format-commit-message.sh>

Phase T00N complete per tasks.md checkpoint.
Feature: <FEATURE_DIR_REL>
Closes #<issue>
EOF
)"
```

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) — [REFERENCE.md](REFERENCE.md)

### PR

```bash
git push -u origin HEAD
gh pr create --base <DEFAULT> --head <phase-branch> --title "T00N: <short title>" --body "..."
```

PR body must include `Closes #<issue>` from tasks.md.

---

## Phase D — Stop

Report: phase id, PR URL, issue #, checkpoint status, tasks.md marks.

**Do not** start the next T00N until human says e.g. "continue to T004".

## tasks.md format

```text
- [ ] T00N **Phase title** — description (issue #N)
```

## Scripts

| Script | Purpose |
|--------|---------|
| `get-feature-context.sh` | Paths + feature base name from `feature.json` |
| `get-phase-branch.sh` | `{base}-t00n` branch name |
| `list-phases.sh` | Phases + issue numbers |
| `get-git-identity.sh` | Local git author |
| `format-commit-message.sh` | Conventional Commits subject |
