# Conventional Commits for Spec Kit Phases

Spec: [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/#summary)

## Message structure

```
<type>(t00n): <short description>

Phase T00N complete per tasks.md checkpoint.
Feature: specs/NNN-feature-name
Closes #<issue>
```

## Type mapping

| Phase title pattern | Type | Example |
|---------------------|------|---------|
| Setup, Initialize | `chore` | `chore(t001): setup` |
| User Story / feature | `feat` | `feat(t003): add-and-view-tasks` |
| Bug fix | `fix` | `fix(t004): toggle-done` |
| Refactor | `refactor` | `refactor(t002): storage-layer` |
| Tests only | `test` | `test(t002): tasks-store-crud` |
| Polish | `chore` | `chore(t007): polish` |

## Branch strategy (per phase)

| Concept | Value | Source |
|---------|-------|--------|
| Feature base | `001-local-todo-app` | basename of `feature.json` → `feature_directory` |
| Phase branch | `001-local-todo-app-t003` | `{base}-{phase_lower}` via `get-phase-branch.sh` |
| PR base | `main` or `master` | `origin/HEAD` |
| PR head | phase branch | one PR per phase |

Workflow: merge T001 PR → branch T002 from updated default → repeat.

## Issue numbers in tasks.md

Required suffix on each top-level phase line:

```markdown
- [ ] T003 **Phase 3: User Story 1** — Add tasks (issue #3)
```

`list-phases.sh --json` returns `"issue": 3`. If missing, stop and ask human to add it (or run `/speckit-taskstoissues` and update `tasks.md`).

## Staging

Always `git add -A` before commit — includes source, tests, config, and `tasks.md` checkbox updates.

## Human gate

Proceed only on explicit approval: "continue to T004", "next phase", "LGTM proceed".
