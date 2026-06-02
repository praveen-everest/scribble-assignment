# Implementation Plan: Room Setup & Lobby

**Branch**: `001-room-setup-lobby` | **Date**: 2026-06-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-room-setup-lobby/spec.md`

## Summary

Implement host tracking, join validation, automatic lobby polling
(~2s), and host-only game start with a 2-player minimum. The
backend Room model gains a `hostId` field and a new `"playing"`
status. A new `POST /rooms/:code/start` endpoint gates game
transitions. The frontend LobbyPage replaces its manual refresh
button with automatic polling, conditionally renders host vs.
non-host UI, and handles poll errors with a Reconnect button.

## Technical Context

**Language/Version**: TypeScript 5.6 (both frontend and backend)

**Primary Dependencies**: Express 4.21 (backend), React 18.3 +
React Router 6.30 (frontend), Zod 3.23 (validation)

**Storage**: In-memory `Map<string, Room>` on the backend

**Testing**: Manual two-tab browser validation per constitution;
Vitest available for unit tests

**Target Platform**: Desktop browser (modern), Node.js 18+

**Project Type**: Web application (frontend + REST backend)

**Performance Goals**: Room create/join < 3s; lobby poll updates
within ~2s of state change

**Constraints**: No WebSockets, no database, no new dependencies,
no authentication

**Scale/Scope**: Lab exercise — 2-5 concurrent players per room,
single server instance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1
design.*

| Principle | Pre-Phase 0 | Post-Phase 1 | Notes |
|-----------|-------------|--------------|-------|
| I. Incremental Delivery | PASS | PASS | 4 user stories map to 4 implementation slices |
| II. Deterministic Game Logic | N/A | N/A | No game logic in Scenario 1 |
| III. AI-Assisted Discipline | PASS | PASS | All changes traceable to spec FRs |
| IV. Testing and Validation | PASS | PASS | Quickstart defines two-tab validation steps |
| V. Simplicity and Scope | PASS | PASS | No new deps, REST polling only, in-memory store |

No violations. Complexity Tracking section not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-room-setup-lobby/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.md
└── checklists/
    ├── requirements.md
    └── spec-review.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── game.ts            # Room, Participant, RoomSnapshot types
│   ├── services/
│   │   └── roomStore.ts       # In-memory store, room CRUD, start logic
│   ├── api/
│   │   ├── rooms.ts           # Route handlers (create, join, fetch, start)
│   │   ├── schemas.ts         # Zod validation schemas
│   │   └── router.ts          # API router and error middleware
│   ├── seed/
│   │   └── starterData.ts     # Word list and roles
│   ├── app.ts                 # Express app factory
│   └── server.ts              # Entry point
└── tests/

frontend/
├── src/
│   ├── pages/
│   │   ├── CreateRoomPage.tsx  # Room creation form
│   │   ├── JoinRoomPage.tsx    # Room join form
│   │   ├── LobbyPage.tsx       # Lobby with polling + host UI
│   │   └── GamePage.tsx        # Game screen (placeholder)
│   ├── components/
│   │   ├── RoomCodeBadge.tsx   # Room code display
│   │   └── ...                 # Existing components
│   ├── state/
│   │   └── roomStore.ts        # Client-side state management
│   ├── services/
│   │   └── api.ts              # HTTP client (API calls)
│   ├── routes/
│   │   └── index.tsx           # Route definitions
│   └── App.tsx
└── tests/
```

**Structure Decision**: Web application layout (Option 2). The
starter already uses `backend/` and `frontend/` directories. No
structural changes needed — all work modifies existing files.

## Implementation Sequence

### Slice 1: Backend — Host Tracking + Name Validation (FR-001, FR-004)

**Files changed**:
- `backend/src/models/game.ts` — Add `hostId` to Room and
  RoomSnapshot, extend RoomStatus to `"lobby" | "playing"`
- `backend/src/services/roomStore.ts` — Set `hostId` on create,
  require and trim `playerName`, include `hostId` in snapshot
- `backend/src/api/schemas.ts` — Make `playerName` required in
  create and join schemas
- `backend/src/api/rooms.ts` — Update handlers to pass required
  name, return `hostId` in responses

**Validation**: `POST /rooms` with name → 201 with `hostId`;
without name → 400.

### Slice 2: Backend — Join Validation (FR-003, FR-005, FR-012)

**Files changed**:
- `backend/src/api/rooms.ts` — Validate empty/whitespace code
  (400), reject join to non-lobby rooms (403), trim code
- `backend/src/api/schemas.ts` — Add code format validation

**Validation**: Join with empty code → 400; join started room
→ 403; join with lowercase code → 200.

### Slice 3: Backend — Start Game Endpoint (FR-009, FR-010, FR-011)

**Files changed**:
- `backend/src/services/roomStore.ts` — Add `startGame(code,
  participantId)` function that validates host, player count,
  and room status, then transitions to `"playing"`
- `backend/src/api/rooms.ts` — Add `POST /rooms/:code/start`
  route handler
- `backend/src/api/schemas.ts` — Add start game schema

**Validation**: Host with 2+ players → 200 status `"playing"`;
non-host → 403; solo host → 400.

### Slice 4: Frontend — Name Validation + API Fix (FR-004)

**Files changed**:
- `frontend/src/services/api.ts` — Fix `API_BASE_URL` bug
  (remove `/bug`), add `hostId` to `RoomSnapshot` type, make
  name required in API calls
- `frontend/src/pages/CreateRoomPage.tsx` — Add client-side
  name validation (trim, reject empty)
- `frontend/src/pages/JoinRoomPage.tsx` — Add client-side name
  and code validation (trim, reject empty)

**Validation**: Empty name → inline error; valid name → room
created.

### Slice 5: Frontend — Lobby Polling + Host UI (FR-007, FR-008, FR-009, FR-013, FR-014)

**Files changed**:
- `frontend/src/pages/LobbyPage.tsx` — Replace manual refresh
  with `setInterval` polling (~2s), cleanup on unmount, show
  "(Host)" label next to host name, conditionally render
  "Start Game" (host) or "Waiting for host" (non-host), disable
  start when < 2 players, handle poll errors with Reconnect
  button
- `frontend/src/state/roomStore.ts` — Add `startGame()` method
  calling new endpoint
- `frontend/src/services/api.ts` — Add `startGame(code,
  participantId)` API call

**Validation**: Two-tab test per quickstart steps 1-5.

### Slice 6: Frontend — Start Game Transition (FR-010, FR-011)

**Files changed**:
- `frontend/src/pages/LobbyPage.tsx` — On poll detecting
  `status: "playing"`, navigate to `/game` automatically.
  Host navigates immediately on successful start response.

**Validation**: Host starts → both tabs end up on game screen.

## Data Flow

```text
Create Room:
  Browser → POST /rooms { playerName } → Backend creates Room
  with hostId = new participant ID → 201 { participantId, room }
  → Frontend stores participantId + room in state → Navigate to
  /lobby

Join Room:
  Browser → POST /rooms/:code/join { playerName } → Backend
  validates code exists + room in lobby + name non-empty → adds
  participant → 200 { participantId, room } → Frontend stores
  state → Navigate to /lobby

Lobby Polling:
  setInterval(2000ms) → GET /rooms/:code → Backend returns
  snapshot with hostId + participants + status → Frontend updates
  state → Re-render participant list, host label, start button
  state. On error → clear interval → show Reconnect button.

Start Game:
  Host clicks Start → POST /rooms/:code/start { participantId }
  → Backend validates hostId match + ≥2 players + lobby status
  → transitions to "playing" → 200 { room } → Host navigates
  to /game. Non-host players detect status: "playing" on next
  poll → navigate to /game.
```

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Stale participants from browser refresh | High | Documented as accepted limitation per spec clarification |
| Poll timing edge case at game start | Low | Non-host redirect on next poll (~2s max delay) |
| API base URL bug masking real errors | High | Fixed in Slice 4 as first frontend change |
