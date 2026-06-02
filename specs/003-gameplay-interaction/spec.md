# Feature Specification: Gameplay Interaction

**Feature Branch**: `003-gameplay-interaction`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "Given a round is active with a drawer and guessers (all scores start at 0), When the drawer draws/clears the canvas and guessers submit their guesses, Then the drawing is visible on the drawer's screen; guesses are trimmed, case-insensitively compared, and empty ones rejected; the guess history is synced to all players via polling; correct guesses score 100 (incorrect add 0)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Drawing on the Canvas (Priority: P1)

The drawer interacts with the canvas area on the game screen to
create a drawing. The drawing is rendered on the drawer's screen
in real time as they draw. A "Clear Canvas" button allows the
drawer to erase the canvas and start over. Only the drawer can
draw and clear; guessers see the canvas as read-only.

**Why this priority**: Drawing is the core interaction that drives
the game. Without a functional canvas, guessers have nothing to
guess from.

**Independent Test**: Start a game as the drawer. Draw on the
canvas and verify strokes appear. Click Clear and verify the
canvas resets. In the guesser tab, verify the canvas area is
read-only.

**Acceptance Scenarios**:

1. **Given** a round is active and a player is the drawer,
   **When** they draw on the canvas, **Then** the strokes are
   rendered on their screen immediately.
2. **Given** a round is active and the drawer has drawn on the
   canvas, **When** they click "Clear Canvas", **Then** the
   canvas is completely cleared.
3. **Given** a round is active and a player is a guesser,
   **When** they view the game screen, **Then** the canvas area
   displays the drawer's current drawing (synced via polling) but
   is not interactive — they cannot draw or clear.
4. **Given** the drawer draws on the canvas, **When** a guesser's
   next poll completes (~2s), **Then** the guesser's canvas
   updates to show the drawer's strokes.
5. **Given** the drawer clicks "Clear Canvas", **When** a
   guesser's next poll completes, **Then** the guesser's canvas
   is also cleared.

---

### User Story 2 - Guess Submission and Validation (Priority: P1)

Guessers submit text guesses through the guess input form.
Guesses are trimmed of whitespace before processing. Empty or
whitespace-only guesses are rejected with a clear error message.
The guess is compared case-insensitively against the secret word.
A correct guess scores 100 points; an incorrect guess scores 0.

**Why this priority**: Guessing is the complement to drawing —
without guess submission and scoring, the game has no objective.

**Independent Test**: As a guesser, submit a guess. Verify it
appears in history. Submit the correct word and verify 100 points
are awarded. Submit an empty guess and verify it is rejected.

**Acceptance Scenarios**:

1. **Given** a round is active and a player is a guesser,
   **When** they submit a non-empty guess, **Then** the guess is
   trimmed, recorded, and appears in the guess history.
2. **Given** a guesser submits the correct word (case-insensitive
   match, e.g., "Rocket" matches "rocket"), **When** the guess is
   processed, **Then** the guesser scores 100 points for that
   guess.
3. **Given** a guesser submits an incorrect word, **When** the
   guess is processed, **Then** the guesser scores 0 points for
   that guess and the guess still appears in the history.
4. **Given** a guesser attempts to submit an empty or
   whitespace-only guess, **When** they click submit, **Then**
   the system rejects the guess with a clear error message and
   does not record it.
5. **Given** a guesser has already guessed correctly, **When**
   they attempt to submit another guess, **Then** the system
   allows it (no lock-out after a correct guess in single-round
   scope).

---

### User Story 3 - Guess History Synced via Polling (Priority: P1)

All players (drawer and guessers) see a shared guess history that
updates via polling. Each entry in the history shows the guesser's
name and their guess text. The history is ordered chronologically
(oldest first). All players see the same history on every poll.

**Why this priority**: Synced history gives the drawer feedback on
guesser progress and gives guessers visibility into what has been
tried.

**Independent Test**: Two tabs — guesser submits a guess, both
tabs show the guess in history within ~2 seconds.

**Acceptance Scenarios**:

1. **Given** a guesser submits a guess, **When** other players
   poll for game state, **Then** the new guess appears in all
   players' guess history within approximately 2 seconds.
2. **Given** multiple guessers submit guesses, **When** any player
   views the guess history, **Then** all guesses are listed in
   chronological order with the guesser's name and guess text.
3. **Given** the drawer views the game screen, **When** guessers
   submit guesses, **Then** the drawer sees the guess history
   update via polling, same as the guessers.

---

### User Story 4 - Score Tracking (Priority: P2)

Each player starts with a score of 0 when the game begins. When
a guesser submits a correct guess, their score increases by 100.
Incorrect guesses add 0 to the score. All players can see the
current scores for all participants on the game screen.

**Why this priority**: Scoring provides the competitive element.
It builds on guess submission (US2) and is needed for the result
screen in Scenario 4.

**Independent Test**: Start a game, submit a correct guess as a
guesser. Verify their score shows 100. Submit an incorrect guess
— verify score remains unchanged.

**Acceptance Scenarios**:

1. **Given** a game has just started, **When** any player views
   the scoreboard, **Then** all participants have a score of 0.
2. **Given** a guesser submits a correct guess, **When** the
   score is updated, **Then** the guesser's score increases by
   100 and is visible to all players on the next poll.
3. **Given** a guesser submits an incorrect guess, **When** the
   score is updated, **Then** the guesser's score does not change
   (adds 0).
4. **Given** multiple guessers each submit correct guesses,
   **When** any player views the scoreboard, **Then** each
   guesser's score reflects their individual correct guess count
   multiplied by 100.

---

### Edge Cases

- What happens if the drawer submits a guess? The drawer MUST NOT
  be able to submit guesses. The guess form is hidden or disabled
  for the drawer.
- What happens if a guesser submits a guess that matches the
  secret word with different casing (e.g., "ROCKET" vs "rocket")?
  The comparison is case-insensitive — this is a correct guess
  and scores 100.
- What happens if a guesser submits a guess with leading/trailing
  whitespace (e.g., " rocket ")? The guess is trimmed before
  comparison. " rocket " matches "rocket" and scores 100.
- What happens if a guesser submits the same guess twice? Both
  guesses are recorded in history. Each correct guess scores 100
  independently.
- What happens if a poll request fails on the game screen? The
  existing poll error handling (stop + Reconnect button) from
  Scenario 2 applies. The last known state is displayed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The drawer MUST be able to draw freehand on the
  canvas area. Strokes MUST render on the drawer's screen
  immediately as they draw.
- **FR-002**: The drawer MUST be able to clear the entire canvas
  with a single "Clear Canvas" action.
- **FR-003**: Guessers MUST NOT be able to draw on or clear the
  canvas. The canvas MUST be read-only for guessers.
- **FR-014**: The drawer's canvas strokes MUST be stored on the
  server as part of the room state.
- **FR-015**: Guessers MUST receive the current canvas data via
  polling (~2s) and render the drawer's drawing on their screen.
- **FR-016**: When the drawer clears the canvas, the server state
  MUST be cleared and guessers MUST see a cleared canvas on the
  next poll.
- **FR-004**: Guessers MUST be able to submit text guesses through
  the guess form. The drawer MUST NOT be able to submit guesses.
- **FR-005**: Submitted guesses MUST be trimmed of leading and
  trailing whitespace before processing.
- **FR-006**: Empty or whitespace-only guesses MUST be rejected
  with a clear error message and MUST NOT be recorded.
- **FR-007**: Guesses MUST be compared against the secret word
  case-insensitively. A match scores 100 points; a non-match
  scores 0.
- **FR-008**: Each guess MUST be recorded in the guess history
  with the guesser's name, guess text, and whether it was correct.
- **FR-009**: The guess history MUST be synced to all players via
  polling at approximately 2-second intervals, consistent with
  existing polling behavior.
- **FR-010**: All participants MUST start with a score of 0 when
  the game begins. Scores are initialized as part of the game
  state.
- **FR-011**: When a correct guess is submitted, the guesser's
  score MUST increase by exactly 100 points. Incorrect guesses
  MUST add 0.
- **FR-012**: The scoreboard MUST display each participant's
  current score and MUST be visible to all players.
- **FR-013**: The scoreboard MUST update via polling, consistent
  with guess history sync.

### Key Entities

- **Guess**: A single guess submission. Attributes: guesser
  participant ID, guesser name, guess text, whether it was correct
  (boolean), timestamp.
- **Room** (extended): Gains a `guesses` list (ordered
  chronologically), per-participant `scores` mapping, and canvas
  drawing data (strokes stored server-side for polling sync).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The drawer can draw on the canvas and strokes are
  visible on their screen immediately. Guessers see the drawing
  within approximately 2 seconds via polling.
- **SC-002**: 100% of empty or whitespace-only guesses are
  rejected with a visible error message.
- **SC-003**: Correct guesses (case-insensitive match) always
  score exactly 100 points; incorrect guesses always score 0.
- **SC-004**: All players see the same guess history and scores
  within approximately 2 seconds of a guess being submitted.
- **SC-005**: The drawer cannot submit guesses and guessers cannot
  draw on the canvas — role-based controls are enforced.
- **SC-006**: Scores are deterministic — submitting the same
  sequence of guesses always produces the same final scores.

## Clarifications

### Session 2026-06-02

- Q: Is the drawer's canvas visible to guessers? → A: Yes. Canvas data is synced to guessers via REST polling (~2s). The drawer's strokes are stored on the server and served to guessers on each poll, using the same pattern as guess history.

## Assumptions

- Scenarios 1 and 2 are fully implemented. The room is in
  "playing" status with a drawer, guessers, and a secret word
  assigned.
- The canvas uses a simple freehand drawing mechanism. No drawing
  tools (shapes, colors, line thickness) beyond basic freehand and
  clear are required.
- Drawing is synced to guessers via REST polling (~2s), not
  WebSockets. The drawer sends each completed stroke to the server
  on mouse-up. Guessers receive the full stroke data on each poll
  cycle and render it on their canvas. This reuses the same
  polling pattern as guess history and scores.
- Guess history and scores are stored in-memory on the backend as
  part of the room state. No persistence across server restarts.
- The guess form input is cleared after each successful
  submission.
- There is no limit on the number of guesses a player can submit.
- The drawer's score remains 0 for the round (drawers do not
  guess).
- Polling continues at ~2s intervals on the game screen, reusing
  the pattern from Scenarios 1 and 2.
