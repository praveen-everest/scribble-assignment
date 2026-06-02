# Tasks: Game Start & Drawer Flow

**Input**: Design documents from `specs/002-game-start-drawer/`

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

**Purpose**: Extend backend types with game state fields that all stories depend on.

- [ ] T001 [P] Add `drawerId: string | null` field to Room interface in backend/src/models/game.ts
- [ ] T002 [P] Add `secretWord: string | null` field to Room interface in backend/src/models/game.ts
- [ ] T003 Add `drawerId: string | null` field to RoomSnapshot interface in backend/src/models/game.ts
- [ ] T004 Add `secretWord: string | null` field to RoomSnapshot interface in backend/src/models/game.ts
- [ ] T005 Initialize `drawerId: null` and `secretWord: null` in `createRoom()` in backend/src/services/roomStore.ts so existing room creation still works

**Checkpoint**: `npm run build` passes in backend/. Room creation returns drawerId: null and secretWord: null.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Game state initialization during startGame that all user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Update `startGame()` in backend/src/services/roomStore.ts to set `room.drawerId = room.hostId` when transitioning to "playing" (FR-001)
- [ ] T007 Update `startGame()` in backend/src/services/roomStore.ts to set `room.secretWord = STARTER_WORDS[0]` when transitioning to "playing" (FR-004) — import STARTER_WORDS from seed/starterData.ts
- [ ] T008 Update `toRoomSnapshot()` in backend/src/services/roomStore.ts to always include `drawerId` from room in the returned snapshot
- [ ] T009 Update frontend RoomSnapshot type in frontend/src/services/api.ts to include `drawerId: string | null` and `secretWord: string | null`

**Checkpoint**: `npm run build` passes in both backend/ and frontend/. POST /rooms/:code/start returns drawerId and secretWord in response.

---

## Phase 3: User Story 1 — Drawer Assignment on Game Start (Priority: P1)

**Goal**: When the game starts, the host is assigned as drawer and all other players are guessers. All players see the drawer identity on the game screen.

**Independent Test**: Create room with 2+ players → start game → game screen shows host as "Drawer" and others as "Guesser".

### Implementation for User Story 1

- [ ] T010 [US1] Update frontend/src/pages/GamePage.tsx to display a participant list showing each player's name and role — derive role from `room.drawerId`: if `participant.id === room.drawerId` show "Drawer", otherwise show "Guesser" (FR-003, FR-006)
- [ ] T011 [US1] Update the game screen header in frontend/src/pages/GamePage.tsx to show the drawer's name prominently (e.g., "Drawing: Alice") so all players know who is drawing (FR-003)
- [ ] T012 [US1] Validate: create room with 3 players → start game → all tabs show same drawer (host) and guessers → roles are consistent across all views (SC-004)

**Checkpoint**: Game screen displays drawer and guesser roles for all participants. Consistent across tabs.

---

## Phase 4: User Story 2 — Secret Word Selection (Priority: P1)

**Goal**: The secret word is deterministically selected as the first word from the starter list ("rocket").

**Independent Test**: Start two separate games → both select "rocket".

### Implementation for User Story 2

- [ ] T013 [US2] Validate deterministic word selection: start game → verify response includes `secretWord: "rocket"` → start a second game in a new room → verify same word "rocket" (SC-003)

**Checkpoint**: Word selection is deterministic. No implementation changes needed beyond Phase 2 (T007 already sets STARTER_WORDS[0]).

---

## Phase 5: User Story 3 — Secret Word Visibility (Priority: P1)

**Goal**: The secret word is visible only to the drawer. Guessers see a placeholder. The server filters the word based on the viewer's participant ID.

**Independent Test**: Two tabs — drawer tab shows "Your word: rocket", guesser tab shows "Guess the word!" with no word visible.

### Implementation for User Story 3

- [ ] T014 [US3] Update `toRoomSnapshot()` in backend/src/services/roomStore.ts to implement viewer-based word filtering: if `viewerParticipantId === room.drawerId`, include `room.secretWord`; otherwise set `secretWord: null`. When room is in lobby or viewerParticipantId is missing, always return `secretWord: null` (FR-005)
- [ ] T015 [US3] Update frontend/src/pages/GamePage.tsx to display the secret word for the drawer — show "Your word: {secretWord}" when `room.secretWord` is present (drawer view) (FR-005)
- [ ] T016 [US3] Update frontend/src/pages/GamePage.tsx to display a placeholder for guessers — show "Guess the word!" when `room.secretWord` is null (guesser view) (FR-005)
- [ ] T017 [US3] Add ~2s polling to frontend/src/pages/GamePage.tsx using `setInterval` + cleanup pattern from LobbyPage — fetch room state on mount and every ~2000ms, stop on unmount, show Reconnect button on error (FR-007)
- [ ] T018 [US3] Validate word visibility: drawer tab shows "Your word: rocket" → guesser tab shows "Guess the word!" with no word visible → verify by inspecting the poll response that guesser receives `secretWord: null` (SC-002)

**Checkpoint**: Word visible to drawer only. Guesser never sees word. Polling active on game screen.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Build validation and end-to-end walkthrough.

- [ ] T019 Run `npm run build` in backend/ and verify clean compilation
- [ ] T020 Run `npm run build` in frontend/ and verify clean compilation
- [ ] T021 Execute full quickstart.md walkthrough (steps 1-5) in two browser tabs to validate all acceptance scenarios end-to-end
- [ ] T022 Verify determinism: start two separate games in different rooms, confirm both assign the same word ("rocket") and the same drawer rule (host)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — frontend role display
- **US2 (Phase 4)**: Depends on Phase 2 — validation only, no new code
- **US3 (Phase 5)**: Depends on Phase 2 — word filtering + game screen UI
- **Polish (Phase 6)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P1)**: Can start after Phase 2 — validation task only
- **US3 (P1)**: Can start after Phase 2 — backend filtering + frontend UI
- US1 and US3 touch the same frontend file (GamePage.tsx), so they should run sequentially

### Parallel Opportunities

Phase 1:
```
T001 + T002 (different fields, same file — apply sequentially)
T003 + T004 (same pattern)
```

Phase 2:
```
T006 + T007 (same function, sequential)
T008 (snapshot — after T006/T007)
T009 (frontend type — parallel with T006-T008)
```

Phase 3 + Phase 4 (after Phase 2):
```
US2 (T013 — validation only) can run in parallel with US1 (T010-T012)
US3 (T014-T018) should follow US1 since both touch GamePage.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Setup types
2. Complete Phase 2: Foundational game state init
3. Complete Phase 3: US1 (Drawer role display)
4. Complete Phase 4: US2 (Validate determinism)
5. **STOP and VALIDATE**: Two-tab test — drawer shown, word selected deterministically

### Incremental Delivery

1. Setup + Foundational → Types and game init ready → Commit
2. US1 → Drawer/guesser roles visible → Commit
3. US2 → Determinism validated → (no code commit needed)
4. US3 → Word visibility + polling → Commit
5. Polish → Build validation + walkthrough → Commit

---

## Notes

- Only 4 source files are modified (game.ts, roomStore.ts, api.ts, GamePage.tsx)
- US2 requires no new code — it's a validation-only phase (T007 in Phase 2 already implements the word selection)
- Game screen polling reuses the LobbyPage pattern (setInterval + cleanup + Reconnect)
- Roles are derived from drawerId, not stored per participant
- Commit after each story per Constitution I (Incremental Delivery)
