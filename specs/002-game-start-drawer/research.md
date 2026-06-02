# Research: Game Start & Drawer Flow

**Feature**: 002-game-start-drawer
**Date**: 2026-06-02

## Findings

### 1. Where to Store Game State (Drawer ID + Secret Word)

**Decision**: Add `drawerId` and `secretWord` fields directly to
the `Room` interface. Initialize them in the existing
`startGame()` function.

**Rationale**: The Room already owns the game session lifecycle
(status transitions). Adding two fields keeps the model flat and
avoids introducing a separate Round entity for a single-round
game. The `startGame()` function already validates host, player
count, and status — extending it to also set drawer and word is
the simplest path.

**Alternatives considered**:
- Separate `Round` object nested in Room → rejected for this
  scenario because only one round exists. A flat structure is
  simpler per Constitution V. Future scenarios can refactor if
  needed.
- Frontend-only drawer/word assignment → rejected because the
  spec requires server-controlled word visibility (FR-005).

### 2. Word Visibility Filtering

**Decision**: Implement word visibility in `toRoomSnapshot()` by
using the existing `viewerParticipantId` parameter (currently
ignored). When the room is in "playing" status, include
`secretWord` only if the viewer is the drawer. Return `null` for
guessers.

**Rationale**: The API already passes `participantId` to
`toRoomSnapshot()` in both the GET and POST handlers. The
infrastructure for viewer-specific responses exists — it just
needs to be activated. This is the server-side filtering mandated
by FR-005 and the spec Assumptions.

**Alternatives considered**:
- Separate endpoint for drawer-only data → rejected as
  unnecessary complexity. The existing GET endpoint with
  participantId filtering is sufficient.
- Frontend-only filtering → rejected per spec Assumption and
  FR-005 ("server controls word visibility").

### 3. Drawer Assignment Rule

**Decision**: Drawer is always `room.hostId` (the first
participant / room creator). Set `room.drawerId = room.hostId` in
`startGame()`.

**Rationale**: The spec explicitly states "the host (or first
player) becomes the drawer." The host is always the first
participant. No randomization is permitted per Constitution II
(Deterministic Game Logic).

### 4. Secret Word Selection Rule

**Decision**: Select `STARTER_WORDS[0]` ("rocket") as the secret
word. Set `room.secretWord = STARTER_WORDS[0]` in `startGame()`.

**Rationale**: The spec and constitution mandate deterministic
word selection. Index 0 for the first (and only) round is the
simplest deterministic rule. The word list is imported from the
existing `starterData.ts` seed file.

### 5. Game Screen Polling

**Decision**: Reuse the same `setInterval` + cleanup pattern from
LobbyPage for the GamePage. Fetch on mount immediately, then poll
every ~2s. Handle errors with Reconnect button, same as lobby.

**Rationale**: FR-007 requires polling consistent with lobby
behavior. Reusing the same pattern avoids new abstractions per
Constitution V.

### 6. Role Display on Game Screen

**Decision**: Derive each participant's role from the room
snapshot: if `participant.id === room.drawerId` then "Drawer",
otherwise "Guesser". Display the role label next to each player's
name in the participant/scoreboard area, following the "(Host)"
label pattern from Scenario 1.

**Rationale**: Roles are derived from `drawerId`, not stored on
each participant. This avoids data duplication and keeps the
model clean. The frontend can compute roles from the snapshot.
