# Tasks: Room Setup & Lobby

**Input**: Design documents from `specs/001-room-setup-lobby/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md

**Tests**: No automated tests requested. Validation is manual two-tab browser testing per constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Setup

**Purpose**: Fix starter bugs and prepare shared type changes that all stories depend on.

- [x] T001 Fix API base URL bug in frontend/src/services/api.ts — change default from `http://localhost:3001/bug` to `http://localhost:3001`
- [x] T002 Extend RoomStatus type to `"lobby" | "playing"` in backend/src/models/game.ts
- [x] T003 Add `hostId: string` field to Room interface in backend/src/models/game.ts
- [x] T004 Add `hostId: string` field to RoomSnapshot interface in backend/src/models/game.ts
- [x] T005 Update `toRoomSnapshot()` in backend/src/services/roomStore.ts to include `hostId` from room in the returned snapshot

**Checkpoint**: Backend compiles with updated types. Frontend API URL fixed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend validation infrastructure that ALL user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T006 Make `playerName` required (non-optional string) in `createRoomSchema` in backend/src/api/schemas.ts
- [x] T007 Make `playerName` required (non-optional string) in `joinRoomSchema` in backend/src/api/schemas.ts
- [x] T008 Update `createRoom()` in backend/src/services/roomStore.ts to trim `playerName`, reject empty/whitespace-only names, and set `hostId` to the new participant's ID on the created room
- [x] T009 Update `joinRoom()` in backend/src/services/roomStore.ts to trim `playerName` and reject empty/whitespace-only names
- [x] T010 Update POST /rooms handler in backend/src/api/rooms.ts to pass required `playerName` and return `hostId` in response
- [x] T011 Update POST /rooms/:code/join handler in backend/src/api/rooms.ts to pass required `playerName`
- [x] T012 Update frontend RoomSnapshot type in frontend/src/services/api.ts to include `hostId: string`

**Checkpoint**: `npm run build` passes in both backend/ and frontend/. POST /rooms with name returns hostId; without name returns 400.

---

## Phase 3: User Story 1 — Create Room as Host (Priority: P1)

**Goal**: A player creates a room and is designated as host. Name validation rejects empty input.

**Independent Test**: Open browser → enter name → Create Room → lobby shows room code and player listed as "(Host)".

### Implementation for User Story 1

- [x] T013 [US1] Add client-side name validation to frontend/src/pages/CreateRoomPage.tsx — trim input, show inline error if empty/whitespace-only, prevent form submission
- [x] T014 [US1] Update lobby participant list in frontend/src/pages/LobbyPage.tsx to display "(Host)" label next to the participant whose ID matches `room.hostId` (FR-013)
- [x] T015 [US1] Validate two-tab room isolation: create two separate rooms, confirm distinct codes and participant lists with no cross-room leakage (FR-006, SC-005)

**Checkpoint**: Room creation works with host tracking. Empty names rejected. Host label visible in lobby.

---

## Phase 4: User Story 2 — Join Room by Code (Priority: P1)

**Goal**: A player joins an existing room by code. Invalid/empty codes and non-lobby rooms are rejected with clear messages.

**Independent Test**: Create room in Tab 1 → join from Tab 2 with room code → joiner sees lobby with both participants.

### Implementation for User Story 2

- [x] T016 [US2] Add server-side validation in backend/src/api/rooms.ts join handler to reject empty/whitespace-only room codes with 400 and message "Room code is required" (FR-003)
- [x] T017 [US2] Add server-side validation in backend/src/api/rooms.ts join handler to reject join attempts to rooms not in "lobby" status with 403 and message "Game already in progress" (FR-012)
- [x] T018 [US2] Add client-side validation to frontend/src/pages/JoinRoomPage.tsx — trim name and code inputs, show inline errors if empty, prevent submission (FR-003, FR-004)
- [x] T019 [US2] Ensure room code case-insensitivity works end-to-end: verify backend uppercases the code param and frontend auto-uppercases input (FR-005)
- [x] T020 [US2] Validate edge cases: join non-existent code → "Room not found"; join empty code → "Room code is required"; join with lowercase → succeeds (SC-004)

**Checkpoint**: Join flow works with all validation. Two-tab test: create in Tab 1, join in Tab 2, both see participant list.

---

## Phase 5: User Story 3 — Lobby Polling (Priority: P2)

**Goal**: Lobby refreshes automatically every ~2s. Polling stops on navigation and on error (with Reconnect button).

**Independent Test**: Three tabs in same room → new player joins → other tabs show new player within ~2s without manual action.

### Implementation for User Story 3

- [x] T021 [US3] Replace manual "Refresh Room" button with automatic `setInterval` polling (~2000ms) in frontend/src/pages/LobbyPage.tsx — call `roomStore.fetchRoom()` on each tick (FR-007)
- [x] T022 [US3] Add cleanup logic in frontend/src/pages/LobbyPage.tsx to clear the polling interval on component unmount or navigation away (FR-008)
- [x] T023 [US3] Add error handling in the polling loop in frontend/src/pages/LobbyPage.tsx — on fetch failure, clear interval and display a "Reconnect" button that restarts polling on click (FR-014)
- [x] T024 [US3] Validate polling: join a new player from another tab, confirm existing tabs update within ~2s (SC-003)

**Checkpoint**: Lobby polls automatically. New joiners appear without refresh. Poll error shows Reconnect. Navigation away stops polling.

---

## Phase 6: User Story 4 — Host Starts Game (Priority: P2)

**Goal**: Only the host can start the game when 2+ players are present. Non-hosts see a waiting message. Game start transitions all players to the game screen.

**Independent Test**: Host tab shows enabled Start button (with 2+ players). Joiner tab shows "Waiting for host to start". Host clicks Start → both tabs navigate to game screen.

### Implementation for User Story 4

- [x] T025 [US4] Add `startGame(code, participantId)` function in backend/src/services/roomStore.ts — validate participantId matches hostId, room is in "lobby" status, and ≥2 participants; transition status to "playing" (FR-009, FR-010, FR-011)
- [x] T026 [US4] Add Zod schema for start game request (`{ participantId: string }`) in backend/src/api/schemas.ts
- [x] T027 [US4] Add POST /rooms/:code/start route handler in backend/src/api/rooms.ts — call `startGame()`, return 200 with room snapshot on success, 403/400/404 on failure per contracts/api.md
- [x] T028 [US4] Add `startGame(code, participantId)` API call in frontend/src/services/api.ts — POST to /rooms/:code/start
- [x] T029 [US4] Add `startGame()` method to RoomStore in frontend/src/state/roomStore.ts — call API, update state on success
- [x] T030 [US4] Update frontend/src/pages/LobbyPage.tsx — show "Start Game" button (disabled if < 2 participants) for host only; show "Waiting for host to start" message for non-host players (FR-009, FR-010)
- [x] T031 [US4] Add game transition logic in frontend/src/pages/LobbyPage.tsx — host navigates to /game on successful start response; non-host players detect `status: "playing"` on next poll and navigate to /game automatically (FR-011)
- [x] T032 [US4] Validate: host alone → Start disabled; 2+ players → Start enabled; non-host → no Start button; host clicks Start → both tabs on game screen (SC-006)

**Checkpoint**: Full lobby→game transition works. Host-only control enforced. All players redirected.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Build validation, end-to-end walkthrough, and cleanup.

- [x] T033 Run `npm run build` in backend/ and verify clean compilation
- [x] T034 Run `npm run build` in frontend/ and verify clean compilation
- [x] T035 Execute full quickstart.md walkthrough (steps 1-5) in two browser tabs to validate all acceptance scenarios end-to-end
- [x] T036 Verify all edge cases: empty name, empty code, non-existent code, lowercase code, join after game started, poll failure reconnect

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2
- **US2 (Phase 4)**: Depends on Phase 2; can run in parallel with US1
- **US3 (Phase 5)**: Depends on Phase 2; benefits from US1+US2 being done (need joiners to test polling)
- **US4 (Phase 6)**: Depends on Phase 2; benefits from US3 (polling needed for non-host game transition)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US3 (P2)**: Can start after Phase 2 — works best after US1+US2 are complete for realistic testing
- **US4 (P2)**: Can start after Phase 2 — backend tasks (T025-T027) are independent; frontend tasks (T028-T031) benefit from US3 polling being in place

### Within Each User Story

- Backend tasks before frontend tasks (data model → API → UI)
- Core implementation before edge case validation
- Story complete before moving to next priority

### Parallel Opportunities

Phase 1:
```
T001 (fix API URL) | T002 + T003 + T004 (type changes)
```

Phase 2:
```
T006 + T007 (schema changes in parallel)
T008 + T009 (store changes — same file, sequential)
T010 + T011 (route handler changes — same file, sequential)
```

Phase 3 + Phase 4 (after Phase 2):
```
US1: T013 (CreateRoomPage) | T014 (LobbyPage host label)
US2: T016 + T017 (backend validation) then T018 (JoinRoomPage)
— US1 and US2 can proceed in parallel (different files)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Create Room as Host)
4. Complete Phase 4: US2 (Join Room by Code)
5. **STOP and VALIDATE**: Two-tab test — create and join works with host label and validation
6. This is a functional MVP: rooms can be created, joined, and host is tracked

### Incremental Delivery

1. Setup + Foundational → Types and validation ready
2. US1 → Host tracking works → Commit
3. US2 → Join validation works → Commit
4. US3 → Polling replaces manual refresh → Commit
5. US4 → Full lobby→game flow → Commit
6. Polish → Build validation + walkthrough → Commit

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group per Constitution I (Incremental Delivery)
- No automated tests — validation is manual two-tab browser testing per Constitution IV
