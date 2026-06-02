<!--
Sync Impact Report
- Version change: N/A → 1.0.0
- Modified principles: N/A (initial ratification)
- Added sections:
  - Core Principles (5 principles)
  - Technology Constraints
  - Quality Gates
  - Governance
- Removed sections: None
- Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ no update needed (Constitution Check section is generic)
  - .specify/templates/spec-template.md — ✅ no update needed (no constitution-specific references)
  - .specify/templates/tasks-template.md — ✅ no update needed (no constitution-specific references)
  - .specify/templates/checklist-template.md — ✅ no update needed (no constitution-specific references)
- Follow-up TODOs: None
-->

# Scribble Lab Constitution

## Core Principles

### I. Incremental Delivery

All work MUST proceed in small, verifiable slices aligned to the
phased scenario order defined in the README. Each slice MUST be
independently demonstrable in two browser tabs before the next
slice begins. Commits MUST be granular and traceable to a
specific spec acceptance criterion or task ID.

**Rationale**: The lab is assessed on traceability between spec,
plan, tasks, and implementation. Large, monolithic changes break
that chain and make deviations impossible to review.

### II. Deterministic Game Logic

Game rules MUST produce identical outcomes for identical inputs.
Word selection MUST be deterministic from the starter seed list.
Scoring MUST follow the fixed rule: correct guess = 100 points,
incorrect guess = 0 points. Guess comparison MUST be
case-insensitive after trimming whitespace. No randomness,
timers, speed bonuses, or probabilistic behavior is permitted.

**Rationale**: Determinism makes game behavior testable and
reproducible across sessions. Non-deterministic behavior cannot
be reliably validated against acceptance criteria.

### III. AI-Assisted Discipline

AI-generated code MUST be reviewed line-by-line before committing.
Every AI suggestion MUST be validated against the current spec and
plan — do not accept output that drifts beyond the defined scope.
AI MUST NOT introduce out-of-scope features, new dependencies, or
architectural changes not present in the plan. The developer MUST
understand every line committed and be able to explain the decision
behind it.

**Rationale**: The lab evaluates the developer's judgment, not the
AI's output volume. Unreviewed AI output creates spec drift and
unexplainable code.

### IV. Testing and Validation

Every feature slice MUST be manually validated in two browser tabs
before it is considered complete. Validation MUST cover the golden
path and at least one edge case (empty input, invalid code,
duplicate join). Build validation (`npm run build`) MUST pass for
both frontend and backend before any handoff or PR. Broken builds
MUST NOT be committed to the branch.

**Rationale**: There is no automated test suite in the starter.
Manual two-tab validation is the primary correctness gate for
multiplayer behavior.

### V. Simplicity and Scope

All implementation MUST stay within the boundaries defined in the
README "Explicitly Out Of Scope" section. No WebSockets, no
databases, no authentication, no new state-management libraries,
no multi-round logic, no timers, no random word packs. New
top-level dependencies MUST be justified against an explicit
requirement. When in doubt, do not build it (YAGNI). Prefer the
simplest solution that satisfies the acceptance criteria.

**Rationale**: Out-of-scope work creates drift between artifacts
and implementation, increases review burden, and does not improve
the lab outcome.

## Technology Constraints

- **Frontend**: Vite + React + TypeScript — no additional UI
  frameworks or state-management libraries beyond what the
  starter ships
- **Backend**: Node.js + Express + TypeScript — in-memory store
  only, no database or ORM
- **Communication**: REST polling only (~2s interval); WebSockets
  and real-time push are out of scope
- **Storage**: In-memory on the backend; restarting the server
  clears all state — this is by design
- **Dependencies**: Only add a dependency if a spec requirement
  cannot be met with the existing stack; document the
  justification in the commit message
- **Seed data**: Use the starter word list (`rocket`, `pizza`,
  `castle`, `guitar`, `sunflower`) and roles (`drawer`,
  `guesser`) — do not extend or randomize

## Quality Gates

- **Pre-commit**: `npm run build` MUST succeed in both `backend/`
  and `frontend/` directories
- **Feature validation**: Each scenario checkpoint MUST be
  verified in two browser tabs (one host, one joiner) before
  moving to the next scenario
- **Edge-case check**: Empty/whitespace inputs, invalid room
  codes, duplicate joins, and case-insensitive guesses MUST be
  tested before a scenario is marked complete
- **Artifact alignment**: Code behavior MUST match the spec; any
  deviation MUST be documented in the spec or reflection report
- **Commit discipline**: Each commit MUST map to a specific task
  or acceptance criterion; avoid batching unrelated changes
- **Self-review**: Re-read every diff before committing — verify
  no debug artifacts, no commented-out code, no out-of-scope
  additions

## Governance

This constitution is the highest-authority document for the
Scribble Lab project. All spec, plan, task, and implementation
decisions MUST comply with these principles. Conflicts between
artifacts MUST be resolved in favor of the constitution.

**Amendments**: Any change to this constitution MUST be documented
with a version bump, a rationale, and an updated Sync Impact
Report. Principle additions or material expansions require a MINOR
version bump. Clarifications and wording fixes require a PATCH
bump. Principle removals or redefinitions require a MAJOR bump.

**Compliance**: Every PR review MUST verify that the implementation
does not violate any principle. Complexity beyond what the
acceptance criteria require MUST be justified in the commit message
or reflection report.

**Version**: 1.0.0 | **Ratified**: 2026-06-02 | **Last Amended**: 2026-06-02
