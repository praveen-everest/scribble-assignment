# Research: Result, Restart & Final Validation

**Feature**: 004-result-restart
**Date**: 2026-06-02

## Findings

### 1. New "result" Room Status

**Decision**: Extend `RoomStatus` to `"lobby" | "playing" | "result"`.

**Rationale**: A distinct status for the result phase allows the
server to control behavior per state — e.g., reveal the word to
all players during "result", reject joins for non-lobby statuses,
and enable restart only from "result".

**Alternatives considered**:
- Boolean `roundEnded` flag on Room → rejected because it creates
  ambiguous compound state (playing + roundEnded). A clean status
  value is simpler.

### 2. End Round Mechanism

**Decision**: Add `POST /rooms/:code/end-round` endpoint.
Host-only. Transitions status from "playing" to "result". No
other state changes — the existing word, scores, guesses, and
strokes are preserved for display.

**Rationale**: The host manually ends the round (no timer). This
follows the same host-only action pattern as startGame. The round
data stays intact so the result screen can display it.

### 3. Restart Mechanism

**Decision**: Add `POST /rooms/:code/restart` endpoint. Host-only.
Transitions status from "result" to "lobby". Clears all round
state: `drawerId = null`, `secretWord = null`, `strokes = []`,
`guesses = []`, `scores = {}`. Preserves `participants`, `hostId`,
and `code`.

**Rationale**: Restart reuses the room rather than creating a new
one. Clearing round state ensures the next game starts fresh.
Preserving participants means players don't need to rejoin.

### 4. Word Visibility on Result Screen

**Decision**: In `toRoomSnapshot()`, when room status is "result",
return `secretWord` to ALL viewers (not just the drawer). This
reuses the existing filtering logic — add an exception for
"result" status.

**Rationale**: The spec requires all players to see the correct
word on the result screen. The simplest approach is to modify the
existing visibility check in toRoomSnapshot rather than adding a
separate field.

### 5. Frontend Result Screen

**Decision**: Reuse the GamePage component with conditional
rendering based on room status. When status is "result", show:
the revealed word, final scores, full guess history, and
host-only "Play Again" button (or waiting message for non-host).
Hide canvas interaction and guess form.

**Rationale**: The result screen displays the same data as the
game screen (scores, history, word) with different controls.
Reusing GamePage avoids creating a new route/page and keeps the
polling infrastructure intact.

### 6. Lobby Transition on Restart

**Decision**: When the lobby poll detects status has changed from
"result" to "lobby", automatically navigate non-host players to
the lobby page. The host navigates on successful restart response.
This mirrors the game-start transition pattern from Scenario 1.

**Rationale**: Consistent with how the lobby→game transition
works. Players poll, detect the status change, and redirect.
