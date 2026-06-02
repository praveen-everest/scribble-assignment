# Specification Quality Checklist: Game Start & Drawer Flow

**Purpose**: Full requirements quality review — completeness, clarity, consistency, and coverage
**Created**: 2026-06-02
**Feature**: [spec.md](../spec.md)
**Depth**: Standard
**Audience**: Reviewer (PR)

## Requirement Completeness

- [ ] CHK001 Is the exact moment of drawer assignment specified — during the startGame transition or as a separate initialization step? [Completeness, Spec §FR-001]
- [ ] CHK002 Are initial game screen contents defined for each role (what the drawer sees vs. what the guesser sees beyond the word)? [Completeness, Gap]
- [ ] CHK003 Is the game screen loading state defined — what does the player see before the first successful game-state fetch? [Completeness, Gap]
- [ ] CHK004 Are score initialization requirements defined for this scenario, or explicitly deferred to Scenario 3? [Completeness, Gap]
- [ ] CHK005 Is the Round entity's "round status" attribute defined with specific allowed values? [Completeness, Spec §Key Entities]

## Requirement Clarity

- [ ] CHK006 Is "clearly labeled as Drawer" quantified with a specific UI element or placement? [Clarity, Spec §FR-003]
- [ ] CHK007 Is "displayed prominently" for the secret word defined with measurable criteria (size, position, formatting)? [Clarity, Spec §US3]
- [ ] CHK008 Is the guesser placeholder message specified exactly, or is "e.g., Guess the word!" merely illustrative? [Clarity, Spec §US3]
- [ ] CHK009 Is "first entry in the starter word list" defined as index 0 of the ordered array, making the deterministic rule unambiguous? [Clarity, Spec §FR-004]

## Requirement Consistency

- [ ] CHK010 Are FR-001 ("host / first participant") and Assumptions ("drawer is always the host") consistent — is "host" always the first participant? [Consistency, Spec §FR-001, §Assumptions]
- [ ] CHK011 Is the polling requirement (FR-007, ~2s) consistent with the Scenario 1 lobby polling clarification (stop on error + Reconnect)? [Consistency, Spec §FR-007]
- [ ] CHK012 Does the Key Entities definition of Participant ("role for the current round") align with FR-002 which assigns roles system-wide rather than per-participant? [Consistency, Spec §FR-002, §Key Entities]

## Acceptance Criteria Quality

- [ ] CHK013 Can SC-002 ("guessers never see the secret word at any point") be objectively verified without defining what "never" covers — initial load, poll responses, browser dev tools? [Measurability, Spec §SC-002]
- [ ] CHK014 Is SC-001 ("within 3 seconds") measured from the Start Game click or from the page transition — and does the measurement include poll latency? [Measurability, Spec §SC-001]

## Scenario Coverage

- [ ] CHK015 Are requirements defined for what the game screen shows immediately after the lobby→game transition before the first poll completes? [Coverage, Gap]
- [ ] CHK016 Is the scenario covered where the host starts the game but the guesser's poll hasn't yet detected the "playing" status? [Coverage, Gap]
- [ ] CHK017 Are requirements defined for how the game screen fetches initial state — immediate fetch on mount or wait for poll cycle? [Coverage, Gap]

## Edge Case Coverage

- [ ] CHK018 Is the behavior specified if the drawer's participant ID no longer exists in the room's participant list (stale ghost from refresh)? [Edge Case, Gap]
- [ ] CHK019 Are requirements defined for what happens if the game screen is accessed directly via URL without going through the lobby start flow? [Edge Case, Gap]

## Dependencies & Assumptions

- [ ] CHK020 Is the dependency on Scenario 1's room status transition ("playing") validated with a cross-reference to the specific FR or endpoint? [Dependency, Spec §Assumptions]
- [ ] CHK021 Is the assumption "server controls word visibility" specific enough about which endpoint filters the word and under what condition? [Assumption, Spec §Assumptions]

## Notes

- 21 items total across 7 quality dimensions
- Focus: full spec review at standard depth
- All items test requirements quality, not implementation behavior
- Items reference spec sections for traceability
