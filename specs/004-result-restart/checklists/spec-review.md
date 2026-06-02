# Specification Quality Checklist: Result, Restart & Final Validation

**Purpose**: Full requirements quality review — completeness, clarity, consistency, and coverage
**Created**: 2026-06-02
**Feature**: [spec.md](../spec.md)
**Depth**: Standard
**Audience**: Reviewer (PR)

## Requirement Completeness

- [ ] CHK001 Is the result screen layout specified — what elements are shown and in what order (word, scores, history)? [Completeness, Spec §FR-002, §FR-003, §FR-004]
- [ ] CHK002 Is the "End Round" button placement and label explicitly defined, or left to implementation? [Completeness, Spec §FR-005]
- [ ] CHK003 Is the "Play Again" button placement and label explicitly defined, or left to implementation? [Completeness, Spec §FR-006]
- [ ] CHK004 Are the exact fields cleared on restart enumerated in a single authoritative list, or spread across multiple sections? [Completeness, Spec §FR-008]
- [ ] CHK005 Is the result screen's word visibility mechanism specified — does the server stop filtering secretWord for guessers, or is a separate "revealedWord" field used? [Completeness, Gap]

## Requirement Clarity

- [ ] CHK006 Is "round has ended" defined precisely — what constitutes the trigger for transitioning to "result"? [Clarity, Spec §US2]
- [ ] CHK007 Is "all round state cleared" an exhaustive list, or could additional state (e.g., canvas strokes from Scenario 3) be missed? [Clarity, Spec §FR-008]
- [ ] CHK008 Is "fresh lobby" behavior after restart defined clearly enough to distinguish from initial room creation? [Clarity, Spec §FR-009]

## Requirement Consistency

- [ ] CHK009 Is the "result" status consistently handled by the existing join-rejection logic — does FR-011 align with Scenario 1's FR-012 for non-lobby rejection? [Consistency, Spec §FR-011]
- [ ] CHK010 Are host-only controls for "End Round" (FR-005) and "Play Again" (FR-006) consistent with the host-only "Start Game" pattern from Scenario 1? [Consistency, Spec §FR-005, §FR-006]
- [ ] CHK011 Is the polling behavior on the result screen (FR-010) consistent with game screen polling from Scenario 3 — same interval, same error handling? [Consistency, Spec §FR-010]

## Acceptance Criteria Quality

- [ ] CHK012 Can SC-001 ("within 2 seconds of the host ending the round") be objectively measured — is the measurement from button click to all players seeing results? [Measurability, Spec §SC-001]
- [ ] CHK013 Can SC-002 ("all round state confirmed cleared") be verified without defining what "confirmed" means in testing terms? [Measurability, Spec §SC-002]

## Scenario Coverage

- [ ] CHK014 Are requirements defined for what the game screen shows during the transition from "playing" to "result" before the first result-state poll completes? [Coverage, Gap]
- [ ] CHK015 Is the scenario covered where the host clicks "End Round" while a guesser's guess is in-flight (race condition)? [Coverage, Gap]
- [ ] CHK016 Are requirements defined for the result screen if only one player remains (all others refreshed/disconnected)? [Coverage, Gap]

## Edge Case Coverage

- [ ] CHK017 Is the behavior specified if the host clicks "Play Again" and then immediately clicks "Start Game" before other players have polled back to the lobby? [Edge Case, Gap]
- [ ] CHK018 Are requirements defined for multiple consecutive restart cycles — does the system handle lobby→playing→result→lobby→playing→result reliably? [Edge Case, Gap]

## Dependencies & Assumptions

- [ ] CHK019 Is the dependency on Scenario 3's strokes/guesses/scores fields validated — does FR-008's clearing list match all fields introduced in Scenario 3? [Dependency, Spec §FR-008]
- [ ] CHK020 Is the assumption "word is always STARTER_WORDS[0] after restart" explicitly stated as a requirement or only in Assumptions and Edge Cases? [Assumption, Spec §Assumptions]

## Notes

- 20 items total across 7 quality dimensions
- Focus: full spec review at standard depth
- All items test requirements quality, not implementation behavior
- Items reference spec sections for traceability
