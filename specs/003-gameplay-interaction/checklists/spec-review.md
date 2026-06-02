# Specification Quality Checklist: Gameplay Interaction

**Purpose**: Full requirements quality review — completeness, clarity, consistency, and coverage
**Created**: 2026-06-02
**Feature**: [spec.md](../spec.md)
**Depth**: Standard
**Audience**: Reviewer (PR)

## Requirement Completeness

- [ ] CHK001 Is the canvas data format/structure specified — what constitutes "strokes" for server storage and polling sync? [Completeness, Spec §FR-014]
- [ ] CHK002 Are canvas data size/complexity limits defined — what happens if the drawing produces very large data payloads? [Completeness, Gap]
- [ ] CHK003 Is the guess submission endpoint contract defined — request format, response codes, error shapes? [Completeness, Gap]
- [ ] CHK004 Are score initialization requirements specified — when exactly are scores set to 0 (on room creation, on game start, or on first poll)? [Completeness, Spec §FR-010]
- [ ] CHK005 Is the canvas clear action's server-side behavior fully specified — does it reset to empty array, null, or a specific cleared state? [Completeness, Spec §FR-016]
- [ ] CHK006 Are requirements defined for what the guess history displays per entry — just name+text, or also timestamp and correctness indicator? [Completeness, Spec §FR-008]

## Requirement Clarity

- [ ] CHK007 Is "freehand drawing" defined with specific interaction mechanics (mouse down/move/up, touch support, stroke properties)? [Clarity, Spec §FR-001]
- [ ] CHK008 Is "clear error message" for rejected guesses specified with exact message text, or is the wording left to implementation? [Clarity, Spec §FR-006]
- [ ] CHK009 Is "approximately 2-second intervals" for canvas sync consistent with the same tolerance used for guess history and lobby polling? [Clarity, Spec §FR-015]
- [ ] CHK010 Is "case-insensitively compared" defined precisely — does it use locale-aware comparison or simple lowercase? [Clarity, Spec §FR-007]

## Requirement Consistency

- [ ] CHK011 Is the canvas sync polling (FR-015) consistent with the guess history polling (FR-009) — same interval, same error handling, same Reconnect pattern? [Consistency, Spec §FR-009, §FR-015]
- [ ] CHK012 Are role-based access controls consistent between canvas (FR-003: guessers can't draw) and guess form (FR-004: drawer can't guess)? [Consistency, Spec §FR-003, §FR-004]
- [ ] CHK013 Does the Guess entity definition (guesser name, text, correct boolean, timestamp) align with what FR-008 requires to be recorded? [Consistency, Spec §FR-008, §Key Entities]

## Acceptance Criteria Quality

- [ ] CHK014 Can SC-001 ("strokes visible immediately" + "guessers see within ~2s") be objectively measured with defined tolerance? [Measurability, Spec §SC-001]
- [ ] CHK015 Can SC-006 ("deterministic scores") be verified without defining the exact input sequence that must produce the same output? [Measurability, Spec §SC-006]

## Scenario Coverage

- [ ] CHK016 Are requirements defined for the initial game screen state before any drawing or guessing has occurred (empty canvas, empty history, all scores 0)? [Coverage, Gap]
- [ ] CHK017 Is the scenario covered where a guesser submits a guess while the canvas sync poll is in-flight — are there ordering/consistency requirements? [Coverage, Gap]
- [ ] CHK018 Are requirements defined for what the drawer sees in the guess history — should correct guesses be visually distinguished from incorrect ones? [Coverage, Gap]
- [ ] CHK019 Is the behavior specified when the guess form is submitted rapidly in succession (debounce, queue, or allow all)? [Coverage, Gap]

## Edge Case Coverage

- [ ] CHK020 Is the behavior defined when a guesser submits a guess that is a substring or partial match of the secret word (e.g., "rock" vs "rocket")? [Edge Case, Spec §FR-007]
- [ ] CHK021 Are requirements defined for maximum guess text length — can a guesser submit an arbitrarily long string? [Edge Case, Gap]
- [ ] CHK022 Is the canvas interaction behavior specified for the guesser — do they see a cursor change or disabled state indicator on the read-only canvas? [Edge Case, Spec §FR-003]

## Dependencies & Assumptions

- [ ] CHK023 Is the dependency on Scenario 2's drawerId and secretWord validated — does the spec cross-reference the specific fields? [Dependency, Spec §Assumptions]
- [ ] CHK024 Is the assumption "no limit on guesses" validated against the storage implications for in-memory guess lists? [Assumption, Spec §Assumptions]
- [ ] CHK025 Is the assumption about drawer score remaining 0 explicitly stated as a requirement or only in assumptions? [Assumption, Spec §Assumptions]

## Notes

- 25 items total across 7 quality dimensions
- Focus: full spec review at standard depth
- All items test requirements quality, not implementation behavior
- Items reference spec sections for traceability
