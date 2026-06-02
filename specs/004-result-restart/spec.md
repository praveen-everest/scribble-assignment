# Feature Specification: Result, Restart & Final Validation

**Feature Branch**: `004-result-restart`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "Given a round has ended, When the result state is displayed and the host restarts, Then all players see the correct word, final scores, and full guess history; on restart, everyone returns to the lobby with players preserved and all round state cleared"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Result Screen (Priority: P1)

When a round ends, the room transitions to a "result" state. All
players see a shared result screen displaying: the correct word
(revealed to everyone), final scores for all participants, and the
full guess history from the round. The drawer and guessers all see
the same result view.

**Why this priority**: The result screen is the payoff of the
game — players need to see how they did. Without it, there is no
closure to the round.

**Independent Test**: Play a round (draw, guess). Trigger the
result state. Verify both tabs show the correct word, all scores,
and full guess history.

**Acceptance Scenarios**:

1. **Given** a round has ended and the room is in "result" status,
   **When** any player views the game screen, **Then** the correct
   word is displayed to all players (not just the drawer).
2. **Given** a round has ended, **When** any player views the
   result screen, **Then** final scores for all participants are
   displayed, reflecting all correct guesses from the round.
3. **Given** a round has ended, **When** any player views the
   result screen, **Then** the full guess history from the round
   is visible, showing each guesser's name, guess text, and
   whether it was correct.
4. **Given** a round has ended, **When** the drawer and a guesser
   both view the result screen, **Then** they see identical
   content — same word, same scores, same history.

---

### User Story 2 - Triggering the Result State (Priority: P1)

The host (or the system) transitions the room from "playing" to
"result" to end the round. Since there is no timer or automatic
round-end trigger in scope, the host manually ends the round by
clicking an "End Round" button on the game screen. This is
analogous to the host starting the game from the lobby.

**Why this priority**: Without a mechanism to end the round, the
game stays in "playing" forever and the result screen is never
reached.

**Independent Test**: During a game, the host clicks "End Round".
Verify the room transitions to "result" and all players see the
result screen.

**Acceptance Scenarios**:

1. **Given** a round is active and the host views the game screen,
   **When** they click "End Round", **Then** the room status
   transitions from "playing" to "result".
2. **Given** the room has transitioned to "result", **When** all
   players poll for state, **Then** they are shown the result
   screen within approximately 2 seconds.
3. **Given** a non-host player is on the game screen, **When**
   they view the controls, **Then** no "End Round" button is
   visible — only the host can end the round.

---

### User Story 3 - Restart to Lobby (Priority: P1)

From the result screen, the host clicks a "Play Again" button to
restart. The room transitions back to "lobby" status. All
participants are preserved (no one is removed). All round state is
cleared: drawer assignment, secret word, canvas strokes, guess
history, and scores are all reset. Players return to the lobby
screen and the host can start a new game.

**Why this priority**: Restart completes the game loop. Without
it, players must manually create a new room to play again.

**Independent Test**: After viewing results, the host clicks
"Play Again". Verify both tabs return to the lobby with the same
participants. Verify all game state is cleared.

**Acceptance Scenarios**:

1. **Given** the room is in "result" status and the host views the
   result screen, **When** they click "Play Again", **Then** the
   room transitions from "result" back to "lobby".
2. **Given** a restart has occurred, **When** any player views the
   lobby, **Then** all participants from the previous round are
   still present in the participant list.
3. **Given** a restart has occurred, **When** any player views the
   lobby, **Then** the drawer assignment, secret word, canvas
   strokes, guess history, and scores are all cleared.
4. **Given** a restart has returned players to the lobby, **When**
   the host clicks "Start Game" again, **Then** a new round
   begins with fresh drawer assignment and word selection.
5. **Given** a non-host player is on the result screen, **When**
   they view the controls, **Then** no "Play Again" button is
   visible — only the host can restart.

---

### Edge Cases

- What happens if a player refreshes during the result screen?
  Their participant ID is lost (per Scenario 1 clarification).
  They must rejoin. Since the room is in "result" status (not
  "lobby"), joining is rejected with "Game already in progress."
- What happens if the host clicks "End Round" when no guesses
  have been submitted? The result screen still shows: the correct
  word, all scores at 0, and an empty guess history.
- What happens if a non-host player navigates to the lobby URL
  during the result state? They should see the result screen or
  be redirected appropriately based on room status.
- What happens after restart if the host starts a new game — is
  the word the same? Yes, per Constitution II (Deterministic
  Game Logic) and the single-round scope: the word is always
  STARTER_WORDS[0] ("rocket"). The drawer is always the host.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support a "result" room status that
  represents the end of a round, distinct from "lobby" and
  "playing".
- **FR-002**: When the room is in "result" status, the correct
  word MUST be visible to all players (drawer and guessers alike).
- **FR-003**: The result screen MUST display final scores for all
  participants.
- **FR-004**: The result screen MUST display the full guess
  history from the round, showing guesser name, guess text, and
  correctness for each entry.
- **FR-005**: Only the host MUST be able to end the round by
  triggering the transition from "playing" to "result". Non-host
  players MUST NOT see an "End Round" control.
- **FR-006**: Only the host MUST be able to restart the game by
  triggering the transition from "result" to "lobby". Non-host
  players MUST NOT see a "Play Again" control.
- **FR-007**: On restart, all participants MUST be preserved in
  the room. No players are removed.
- **FR-008**: On restart, all round state MUST be cleared: drawer
  assignment set to null, secret word set to null, canvas strokes
  cleared, guess history cleared, and all scores reset to 0.
- **FR-009**: After restart, the room MUST behave identically to
  a fresh lobby — the host can start a new game with the same
  start-game rules (2+ players, host-only).
- **FR-010**: The result screen and lobby MUST continue to poll
  for state at approximately 2-second intervals so all players
  detect transitions.
- **FR-011**: Joining a room in "result" status MUST be rejected
  with a clear message, consistent with the existing "Game
  already in progress" behavior for "playing" status.

### Key Entities

- **Room** (extended): Gains the "result" status value. No new
  fields — the existing word, scores, guesses, and strokes are
  displayed as-is during the result phase and cleared on restart.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All players see the correct word, final scores, and
  full guess history on the result screen within 2 seconds of the
  host ending the round.
- **SC-002**: After restart, all participants are preserved and
  all round state (drawer, word, strokes, guesses, scores) is
  confirmed cleared.
- **SC-003**: The host can start a new game after restart, and
  the new game behaves identically to the first (same word, same
  drawer assignment rule).
- **SC-004**: Non-host players cannot end the round or restart
  the game — host-only controls are enforced.
- **SC-005**: The full game loop (lobby → game → result → lobby)
  completes successfully in two browser tabs without errors.

## Assumptions

- Scenarios 1, 2, and 3 are fully implemented. The room has
  "playing" status with a drawer, secret word, strokes, guesses,
  and scores.
- The round ends manually when the host clicks "End Round".
  There is no automatic round-end trigger (no timer, no
  "everyone guessed correctly" detection). Timers are explicitly
  out of scope per the README.
- The "result" status is a new room status value added alongside
  "lobby" and "playing".
- On the result screen, the secret word is revealed to everyone
  by returning it in the snapshot for all viewers (not just the
  drawer).
- After restart, the word selection and drawer assignment follow
  the same deterministic rules as before: STARTER_WORDS[0] and
  host as drawer.
- Polling continues on the result screen using the same ~2s
  interval and Reconnect pattern from previous scenarios.
- The "Play Again" restart is a simple status reset, not a new
  room creation. The room code, participants, and host remain
  the same.
