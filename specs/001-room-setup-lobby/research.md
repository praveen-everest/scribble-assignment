# Research: Room Setup & Lobby

**Feature**: 001-room-setup-lobby
**Date**: 2026-06-02

## Findings

### 1. Host Tracking — Where to Store Host Status

**Decision**: Add a `hostId` field to the Room model on the backend.
The host is the `participantId` of the player who created the room.

**Rationale**: Storing host as a room-level field (rather than a
boolean on each participant) is simpler and avoids inconsistent
state where multiple participants could be flagged as host.

**Alternatives considered**:
- Boolean `isHost` on Participant → rejected because it requires
  scanning all participants to find the host and risks dual-host
  bugs.
- Separate host lookup table → rejected as unnecessary complexity
  for in-memory storage.

### 2. Room Status Transitions

**Decision**: Extend `RoomStatus` from `"lobby"` to
`"lobby" | "playing"`. The `"playing"` status is the "game state"
referenced in the spec.

**Rationale**: A single string union type is the simplest way to
gate lobby vs. game behavior. Future scenarios (result, restart)
will add more statuses, but only `"playing"` is needed now.

**Alternatives considered**:
- Numeric status codes → rejected for readability.
- Full state machine library → rejected per Constitution V
  (Simplicity).

### 3. Start Game Endpoint

**Decision**: Add `POST /rooms/:code/start` endpoint. Only the
host (identified by `participantId` in the request body) can
trigger it. The endpoint validates: caller is host, room is in
lobby status, and at least 2 participants are present.

**Rationale**: A dedicated endpoint is cleaner than overloading
the existing room update flow. The host's `participantId` is
sent in the body to authorize the action.

**Alternatives considered**:
- `PATCH /rooms/:code` with status field → rejected because it
  exposes generic room mutation, which violates the principle of
  host-only control.

### 4. Lobby Polling Strategy

**Decision**: Use `setInterval` with ~2000ms delay inside a
`useEffect` hook on the LobbyPage. Cleanup on unmount or
navigation. On fetch error, clear the interval and show a
"Reconnect" button.

**Rationale**: `setInterval` + cleanup is the simplest polling
mechanism available without adding dependencies. The spec
requires polling to stop on navigation (cleanup) and on error
(clear + reconnect UI).

**Alternatives considered**:
- `setTimeout` recursive chain → slightly more complex for the
  same result, no meaningful benefit.
- Library-based polling (react-query, SWR) → rejected per
  Constitution V (no new dependencies).

### 5. Player Name Validation

**Decision**: Make `playerName` required (not optional) on both
create and join endpoints. Trim whitespace server-side. Reject
empty or whitespace-only names with a 400 error. Add matching
client-side validation for immediate feedback.

**Rationale**: Spec FR-004 requires rejecting empty/whitespace
names. The starter currently treats `playerName` as optional,
defaulting to "Player" — this must change to enforce validation.

**Alternatives considered**:
- Client-side only validation → rejected because the server must
  be the source of truth for room state integrity.

### 6. Frontend API Base URL Bug

**Decision**: Fix the default `API_BASE_URL` in
`frontend/src/services/api.ts` from `http://localhost:3001/bug`
to `http://localhost:3001`.

**Rationale**: This is a starter bug that will break all API
calls when `VITE_API_URL` is not set. Must be fixed as part of
the foundational work.

### 7. Join Validation Enhancements

**Decision**: Add server-side validation for: (a) empty/whitespace
room codes return 400, (b) rooms in non-lobby status return 403
with "Game already in progress" message. Add client-side
validation for empty code before making the API call.

**Rationale**: Spec FR-003 and FR-012 require these validations.
The starter currently only checks if the room exists (404) but
does not validate code format or room status.
