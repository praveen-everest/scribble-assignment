# Tasks: Result, Restart & Final Validation

**Input**: Design documents from `specs/004-result-restart/`

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

**Purpose**: Extend RoomStatus with "result" and update frontend type.

- [ ] T001 Extend `RoomStatus` type to `"lobby" | "playing" | "result"` in backend/src/models/game.ts (FR-001)
- [ ] T002 Update frontend RoomSnapshot `status` type to `"lobby" | "playing" | "result"` in frontend/src/services/api.ts

**Checkpoint**: Both builds pass with new status type.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend logic for end-round, restart, and word visibility during result. Blocks all user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 Add `endRound(code, participantId)` function in backend/src/services/roomStore.ts — validate room exists, status is "playing", participantId matches hostId; transition status to "result"; preserve all game state (FR-005)
- [ ] T004 Add `restart(code, participantId)` function in backend/src/services/roomStore.ts — validate room exists, status is "result", participantId matches hostId; transition status to "lobby"; clear drawerId=null, secretWord=null, strokes=[], guesses=[], scores={}; preserve participants and hostId (FR-006, FR-007, FR-008)
- [ ] T005 Update `toRoomSnapshot()` in backend/src/services/roomStore.ts — when status is "result", return secretWord to ALL viewers (not just drawer) so the word is revealed on the result screen (FR-002)
- [ ] T006 Add Zod schemas for end-round request (`{ participantId }`) and restart request (`{ participantId }`) in backend/src/api/schemas.ts
- [ ] T007 Add POST /rooms/:code/end-round route handler in backend/src/api/rooms.ts — parse body, call endRound(), return room snapshot on success or 403/400 on failure per contracts/api.md
- [ ] T008 Add POST /rooms/:code/restart route handler in backend/src/api/rooms.ts — parse body, call restart(), return room snapshot on success or 403/400 on failure per contracts/api.md
- [ ] T009 Update join handler in backend/src/api/rooms.ts to reject joins when room status is "result" with 403 "Game already in progress" (FR-011)
- [ ] T010 Add `api.endRound(code, participantId)` and `api.restart(code, participantId)` methods in frontend/src/services/api.ts
- [ ] T011 Add `endRound()` and `restart()` methods to RoomStore in frontend/src/state/roomStore.ts — call API, then fetchRoom to refresh state

**Checkpoint**: `npm run build` passes. End-round transitions playing→result with word revealed. Restart transitions result→lobby with state cleared.

---

## Phase 3: User Story 1 — Result Screen (Priority: P1)

**Goal**: All players see the correct word, final scores, and full guess history on the result screen.

**Independent Test**: End a round → both tabs show word "rocket", scores, and guess history.

### Implementation for User Story 1

- [ ] T012 [US1] Update frontend/src/pages/GamePage.tsx to detect `room.status === "result"` and render a result view: display the revealed secret word prominently for all players (not just the drawer), show final scores for all participants, and show the full guess history (FR-002, FR-003, FR-004)
- [ ] T013 [US1] Ensure the result view hides canvas interaction (no drawing/clearing) and hides the guess form — the result screen is read-only (FR-002)
- [ ] T014 [US1] Validate result screen: end round → both tabs show "rocket" as the word, same scores, same guess history → drawer and guesser views are identical (SC-001)

**Checkpoint**: Result screen shows word, scores, and history to all players.

---

## Phase 4: User Story 2 — Triggering the Result State (Priority: P1)

**Goal**: The host ends the round from the game screen. Non-host players do not see the End Round button.

**Independent Test**: Host clicks End Round → room transitions to result → all players see result screen.

### Implementation for User Story 2

- [ ] T015 [US2] Add "End Round" button in frontend/src/pages/GamePage.tsx — visible only to the host when status is "playing"; calls roomStore.endRound(); host sees result screen immediately after successful response (FR-005)
- [ ] T016 [US2] Ensure non-host players on the game screen do NOT see the "End Round" button — only a playing status indicator (FR-005)
- [ ] T017 [US2] Add game-screen poll transition logic in frontend/src/pages/GamePage.tsx — when non-host players detect `status === "result"` on poll, switch to the result view (FR-010)
- [ ] T018 [US2] Validate: host clicks End Round → room status becomes "result" → non-host sees result screen within ~2s → non-host has no End Round button (SC-004)

**Checkpoint**: Host can end the round. All players transition to result screen.

---

## Phase 5: User Story 3 — Restart to Lobby (Priority: P1)

**Goal**: The host restarts from the result screen. All players return to lobby with participants preserved and round state cleared.

**Independent Test**: Host clicks Play Again → both tabs return to lobby → same participants, no game state.

### Implementation for User Story 3

- [ ] T019 [US3] Add "Play Again" button in the result view of frontend/src/pages/GamePage.tsx — visible only to the host when status is "result"; calls roomStore.restart(); host navigates to /lobby after successful response (FR-006)
- [ ] T020 [US3] Show "Waiting for host to restart" message for non-host players on the result screen (FR-006)
- [ ] T021 [US3] Add result-screen poll transition logic in frontend/src/pages/GamePage.tsx — when non-host players detect `status === "lobby"` on poll, navigate to /lobby (FR-010)
- [ ] T022 [US3] Validate restart: host clicks Play Again → both tabs return to lobby → both players present → drawer, word, strokes, guesses, scores all cleared (SC-002)
- [ ] T023 [US3] Validate full game loop: lobby → start game → play round → end round → result → play again → lobby → start game again → verify fresh state (SC-003, SC-005)

**Checkpoint**: Full game loop completes. Participants preserved, round state cleared on restart.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Build validation and end-to-end walkthrough.

- [ ] T024 Run `npm run build` in backend/ and verify clean compilation
- [ ] T025 Run `npm run build` in frontend/ and verify clean compilation
- [ ] T026 Execute full quickstart.md walkthrough (steps 1-5) in two browser tabs to validate all acceptance scenarios end-to-end
- [ ] T027 Verify host-only controls: non-host cannot end round or restart; End Round and Play Again buttons hidden for non-host (SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — result screen display
- **US2 (Phase 4)**: Depends on Phase 2 — end round trigger
- **US3 (Phase 5)**: Depends on US1 + US2 (needs result screen + end round to test restart)
- **Polish (Phase 6)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — result screen rendering
- **US2 (P1)**: Can start after Phase 2 — end round button + transition; can run in parallel with US1
- **US3 (P1)**: Depends on US1 + US2 (restart from result screen)

### Parallel Opportunities

Phase 1:
```
T001 (backend type) | T002 (frontend type) — different files
```

Phase 2:
```
T003-T009 — backend sequential (same files)
T010-T011 — frontend, parallel with T003-T009
```

Phase 3 + Phase 4 (after Phase 2):
```
US1 (T012-T014) | US2 (T015-T018) — same file (GamePage.tsx), recommend sequential
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Phase 1 + Phase 2: Types and backend logic
2. Phase 3 (US1): Result screen display
3. Phase 4 (US2): End round trigger
4. **STOP and VALIDATE**: Host ends round → result screen shows word/scores/history

### Incremental Delivery

1. Setup + Foundational → Status type + backend logic → Commit
2. US1 → Result screen display → Commit
3. US2 → End round trigger → Commit
4. US3 → Restart to lobby + full loop → Commit
5. Polish → Build validation + walkthrough → Commit

---

## Notes

- 7 source files modified (game.ts, roomStore.ts, rooms.ts, schemas.ts, api.ts, roomStore.ts, GamePage.tsx)
- 2 new endpoints: end-round, restart
- Result screen reuses GamePage with conditional rendering based on status
- US1 and US2 both modify GamePage.tsx — implement sequentially
- Full game loop validation (T023) is the key acceptance test for this scenario
- Commit after each story per Constitution I (Incremental Delivery)
