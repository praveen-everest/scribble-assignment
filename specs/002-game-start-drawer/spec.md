# Feature Specification: Game Start & Drawer Flow

**Feature Branch**: `002-game-start-drawer`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "Given a game is starting and player names are trimmed (empty/whitespace-only rejected with a message), When the first round begins, Then the host (or first player) becomes the clearly-identified drawer, and the secret word (deterministically selected from the starter list) is visible only to the drawer"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Drawer Assignment on Game Start (Priority: P1)

When the host starts the game (transitioning from lobby to
playing), the system assigns the host (first player) as the
drawer for the round. All players transition to the game screen
where the drawer is clearly identified. Every other player is
assigned the guesser role.

**Why this priority**: Without a drawer, no round can begin.
Drawer assignment is the core prerequisite for all gameplay
interaction.

**Independent Test**: Create a room with 2+ players. Host
starts the game. Verify the game screen shows the host as the
drawer and all other players as guessers.

**Acceptance Scenarios**:

1. **Given** a room has transitioned to the playing state,
   **When** the game screen loads for any player, **Then** the
   host (first player) is assigned the drawer role and is
   clearly labeled as "Drawer" on all players' screens.
2. **Given** a room has transitioned to the playing state,
   **When** the game screen loads for a non-host player, **Then**
   that player is assigned the guesser role and the UI reflects
   their guesser status.
3. **Given** a room has 3 players (host + 2 joiners), **When**
   the game starts, **Then** exactly 1 player (the host) is the
   drawer and the remaining 2 are guessers.

---

### User Story 2 - Secret Word Selection (Priority: P1)

When the round begins, the system deterministically selects a
secret word from the starter word list. The selection is based
on a fixed index (the first word in the list for the first
round) so that identical game state always produces the same
word.

**Why this priority**: The secret word is the objective of the
round. Without it, the drawer has nothing to draw and guessers
have nothing to guess.

**Independent Test**: Start two separate games. Verify both
select the same first word from the seed list.

**Acceptance Scenarios**:

1. **Given** a round begins for the first time in a room,
   **When** the secret word is selected, **Then** the system
   picks the first word from the starter seed list ("rocket").
2. **Given** the starter word list is `["rocket", "pizza",
   "castle", "guitar", "sunflower"]`, **When** the first round
   starts, **Then** the word "rocket" is always selected — the
   selection is deterministic, not random.

---

### User Story 3 - Secret Word Visibility (Priority: P1)

The secret word is displayed only to the drawer on the game
screen. Guessers MUST NOT see the secret word. The drawer sees
the word prominently so they know what to draw.

**Why this priority**: Word visibility rules are fundamental to
fair gameplay. If guessers see the word, the game is broken.

**Independent Test**: Start a game in two tabs. In the drawer's
tab, verify the secret word is displayed. In the guesser's tab,
verify the word is hidden or masked.

**Acceptance Scenarios**:

1. **Given** a round is active and a player is the drawer,
   **When** they view the game screen, **Then** the secret word
   is displayed prominently (e.g., "Your word: rocket").
2. **Given** a round is active and a player is a guesser,
   **When** they view the game screen, **Then** the secret word
   is not visible — the system shows a placeholder or prompt
   (e.g., "Guess the word!") instead.
3. **Given** a round is active, **When** a guesser polls for
   updated game state, **Then** the response does not contain
   the secret word for that player.

---

### Edge Cases

- What happens if a player refreshes the game screen mid-round?
  Their participant ID is lost (per Scenario 1 clarification).
  They must rejoin the room. Since the room is in playing state,
  joining is rejected with "Game already in progress."
- What happens if only 2 players are in the game and the guesser
  disconnects? The drawer remains on the game screen. The round
  continues with the drawer alone. No automatic role changes.
- What happens if the drawer's poll request fails? The game
  screen shows the last known state. The word remains visible
  from the initial load or last successful poll.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When the room transitions to "playing", the system
  MUST assign the host (first participant) as the drawer for the
  round.
- **FR-002**: All participants other than the drawer MUST be
  assigned the guesser role.
- **FR-003**: The drawer's identity (name and role) MUST be
  clearly visible to all players on the game screen.
- **FR-004**: The system MUST deterministically select the secret
  word using the first entry in the starter word list ("rocket")
  for the first round.
- **FR-005**: The secret word MUST be visible only to the drawer.
  The game state returned to guessers MUST NOT include the secret
  word.
- **FR-006**: The game screen MUST display each player's current
  role (drawer or guesser) so all participants understand who is
  drawing.
- **FR-007**: The game screen MUST continue to poll for updated
  state at approximately 2-second intervals, consistent with
  lobby polling behavior.
- **FR-008**: Player names MUST be trimmed of whitespace. Empty
  or whitespace-only names MUST be rejected with a clear error
  message. (Carried forward from Scenario 1; no new
  implementation needed.)

### Key Entities

- **Room** (extended): Gains game-level state: drawer participant
  ID and selected secret word, stored directly on the room. No
  separate Round entity — game state is flat for single-round
  scope.
- **Participant** (unchanged): Roles (drawer or guesser) are
  derived from the room's drawer ID, not stored per participant.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When a game starts, all players see the game screen
  with drawer identification within 3 seconds of the host
  clicking Start.
- **SC-002**: The drawer sees the secret word on the game screen.
  Guessers never see the secret word at any point during the
  round.
- **SC-003**: The secret word selection is deterministic — the
  same starter list always produces the same word for the first
  round across separate game sessions.
- **SC-004**: 100% of players see a consistent view of who is the
  drawer and who is a guesser.

## Assumptions

- Scenario 1 (Room Setup & Lobby) is fully implemented. The room
  transitions to "playing" status when the host clicks Start
  Game.
- Only one round is played per game session. Multi-round support,
  drawer rotation, and round timers are explicitly out of scope.
- The drawer is always the host (first participant). No
  randomized drawer selection.
- The secret word for the first round is always the first word in
  the starter seed list. No random or rotating word selection.
- The game screen polls the server for state updates, reusing the
  same ~2-second polling pattern established in Scenario 1.
- The server controls word visibility — the secret word is
  filtered from responses sent to guessers, not hidden by
  frontend logic alone.
