# Spec Kit Implementation Core (single-phase scope)

Execute these steps **before** git commit/PR. Sourced from `/speckit-implement`; scoped to **one T00N phase** per git-workflow run.

**Phase filter**: Only implement the target `T00N` block and its sub-checklists. Do not start later phases.

## A. Extension hooks (before implementation)

Check `.specify/extensions.yml` for `hooks.before_implement` — same rules as `speckit-implement` Pre-Execution Checks.

## B. Prerequisites

Run from repo root:

```bash
.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks
```

Parse `FEATURE_DIR`, `AVAILABLE_DOCS` (absolute paths).

Also run git-workflow scripts:

```bash
get-feature-context.sh --json
list-phases.sh --json
```

Confirm target phase `id`, `issue`, `done: false`.

## C. Checklists gate

If `FEATURE_DIR/checklists/` exists:

- Count `- [ ]` / `- [x]` per file; build status table
- **PASS** (all complete) → continue
- **FAIL** → STOP; ask: "Checklists incomplete. Proceed anyway? (yes/no)"

## D. Load implementation context

| Doc | Required |
|-----|----------|
| `tasks.md` | Yes — full file; execute **one phase** only |
| `plan.md` | Yes — tech stack, structure, test strategy |
| `spec.md` | Yes — user stories, requirements |
| `data-model.md` | If exists |
| `contracts/` | If exists |
| `research.md` | If exists |
| `.specify/memory/constitution.md` | If exists |
| `quickstart.md` | If exists — use for phase checkpoint / independent test |

## E. Project setup verification

Create/verify ignore files per detected stack (same rules as `speckit-implement` step 4):

- `.gitignore` if git repo
- `.dockerignore`, `.eslintignore`, `.prettierignore`, etc. as applicable
- Append missing critical patterns only when file exists

## F. Parse tasks.md for target phase

Extract for **target T00N only**:

- Sub-checklist items (with and without task IDs)
- Deliverables, Goal, Checkpoint, TDD cycles
- Dependencies (prior phases must already be merged/done)

## G. Execute phase implementation

Apply `speckit-implement` execution rules **within this phase**:

- **TDD**: RED → GREEN per behavior; one cycle at a time
- **Order**: tests before implementation where specified; models before services; UI after store cycles GREEN
- **Checkpoints**: run commands from tasks.md (e.g. `pnpm test`, `pnpm check`) before marking complete
- **Progress**: report after each sub-item
- **Mark complete**: `[x]` on sub-items, then top-level `T00N` line in `tasks.md`
- **Halt** on non-recoverable failure; do not proceed to git commit if checkpoint fails

## H. Phase validation (before git steps)

- [ ] Phase checkpoint passes
- [ ] Sub-checklist items for this T00N marked `[x]`
- [ ] Top-level `- [x] T00N` marked in `tasks.md`
- [ ] Changes match `spec.md` / `plan.md` for this phase scope
- [ ] Constitution constraints respected

Do **not** validate later phases.

## I. Extension hooks (after implementation, before git commit)

Check `hooks.after_implement` in `.specify/extensions.yml` — same rules as `speckit-implement` Mandatory Post-Execution Hooks.

Then proceed to git-workflow steps: confirm author → `git add -A` → commit → PR → stop.
