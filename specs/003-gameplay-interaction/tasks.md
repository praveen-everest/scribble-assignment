# Tasks: Gameplay Interaction

**Input**: Design documents from `specs/003-gameplay-interaction/`

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

**Purpose**: Extend backend types with canvas, guess, and score data structures that all stories depend on.

- [x] T001 Add `Point` interface (`{ x: number; y: number }`) to backend/src/models/game.ts
- [x] T002 Add `Guess` interface (`{ participantId, playerName, text, correct, timestamp }`) to backend/src/models/game.ts
- [x] T003 Add `strokes: Point[][]` field to Room interface in backend/src/models/game.ts (default `[]`)
- [x] T004 Add `guesses: Guess[]` field to Room interface in backend/src/models/game.ts (default `[]`)
- [x] T005 Add `scores: Record<string, number>` field to Room interface in backend/src/models/game.ts (default `{}`)
- [x] T006 Add `strokes: Point[][]`, `guesses: Guess[]`, `scores: Record<string, number>` fields to RoomSnapshot interface in backend/src/models/game.ts

**Checkpoint**: Backend compiles with new types.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Initialize game state in startGame and expose new fields via snapshot. Blocks all user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Initialize `strokes: []`, `guesses: []` in `createRoom()` in backend/src/services/roomStore.ts
- [x] T008 Initialize `scores` in `startGame()` in backend/src/services/roomStore.ts — create a `Record<string, number>` mapping every participant's ID to 0 (FR-010)
- [x] T009 Initialize `strokes: []` and `guesses: []` in `startGame()` in backend/src/services/roomStore.ts (ensure clean state on game start)
- [x] T010 Update `toRoomSnapshot()` in backend/src/services/roomStore.ts to include `strokes`, `guesses`, and `scores` from room in the returned snapshot
- [x] T011 Update frontend RoomSnapshot type in frontend/src/services/api.ts to include `strokes: Array<Array<{x: number; y: number}>>`, `guesses: Array<{participantId: string; playerName: string; text: string; correct: boolean; timestamp: string}>`, and `scores: Record<string, number>`

**Checkpoint**: `npm run build` passes. GET /rooms/:code returns strokes, guesses, and scores in response. All scores start at 0.

---

## Phase 3: User Story 1 — Drawing on the Canvas (Priority: P1)

**Goal**: The drawer draws freehand on an HTML5 Canvas. Strokes are stored on the server and synced to guessers via polling. Clear Canvas resets all strokes.

**Independent Test**: Drawer draws → strokes appear locally. Guesser sees drawing within ~2s. Clear Canvas clears for both.

### Implementation for User Story 1

- [x] T012 [US1] Add `addStroke(code, participantId, stroke)` function in backend/src/services/roomStore.ts — validate room exists, status is "playing", participantId matches drawerId; append stroke to room.strokes (FR-001, FR-014)
- [x] T013 [US1] Add `clearCanvas(code, participantId)` function in backend/src/services/roomStore.ts — validate room exists, status is "playing", participantId matches drawerId; set room.strokes to empty array (FR-002, FR-016)
- [x] T014 [US1] Add Zod schemas for draw request (`{ participantId, stroke: [{x, y}] }`) and clear request (`{ participantId }`) in backend/src/api/schemas.ts
- [x] T015 [US1] Add POST /rooms/:code/draw route handler in backend/src/api/rooms.ts — parse body, call addStroke(), return 200 `{ ok: true }` or 403/400 on failure per contracts/api.md
- [x] T016 [US1] Add POST /rooms/:code/clear route handler in backend/src/api/rooms.ts — parse body, call clearCanvas(), return 200 `{ ok: true }` or 403/400 on failure
- [x] T017 [US1] Add `api.draw(code, participantId, stroke)` and `api.clearCanvas(code, participantId)` methods in frontend/src/services/api.ts
- [x] T018 [US1] Add `addStroke(stroke)` and `clearCanvas()` methods to RoomStore in frontend/src/state/roomStore.ts — call API, then fetchRoom to refresh state
- [x] T019 [US1] Replace canvas placeholder in frontend/src/pages/GamePage.tsx with an HTML5 Canvas element — implement freehand drawing for the drawer using mousedown/mousemove/mouseup events, capture normalized (0-1) coordinates, send completed stroke to server on mouseup via roomStore.addStroke()
- [x] T020 [US1] Render strokes from `room.strokes` on the canvas for all players in frontend/src/pages/GamePage.tsx — on each poll update, redraw all strokes from the room state (guessers see the drawer's work)
- [x] T021 [US1] Add "Clear Canvas" button for the drawer only in frontend/src/pages/GamePage.tsx — calls roomStore.clearCanvas(); hide button for guessers (FR-003)
- [x] T022 [US1] Make canvas non-interactive for guessers in frontend/src/pages/GamePage.tsx — disable mouse event handlers when viewer is not the drawer (FR-003)
- [x] T023 [US1] Validate canvas: drawer draws → strokes appear locally → guesser sees drawing within ~2s → drawer clears → guesser canvas clears within ~2s (SC-001)

**Checkpoint**: Canvas drawing and sync works. Guessers see the drawing. Clear works for both.

---

## Phase 4: User Story 2 — Guess Submission and Validation (Priority: P1)

**Goal**: Guessers submit text guesses. Guesses are trimmed, case-insensitively compared, scored (100/0), and recorded in history. Drawer cannot guess.

**Independent Test**: Guesser submits "rocket" → correct, scores 100. Submits "pizza" → incorrect, scores 0. Empty → rejected.

### Implementation for User Story 2

- [x] T024 [US2] Add `submitGuess(code, participantId, text)` function in backend/src/services/roomStore.ts — validate room playing + participantId is not drawerId + text trimmed non-empty; compare case-insensitively to secretWord; record guess with correct flag; update score += 100 if correct (FR-004 through FR-008, FR-011)
- [x] T025 [US2] Add Zod schema for guess request (`{ participantId, text }`) in backend/src/api/schemas.ts
- [x] T026 [US2] Add POST /rooms/:code/guess route handler in backend/src/api/rooms.ts — parse body, call submitGuess(), return 200 with guess object or 400/403 on failure per contracts/api.md
- [x] T027 [US2] Add `api.submitGuess(code, participantId, text)` method in frontend/src/services/api.ts
- [x] T028 [US2] Add `submitGuess(text)` method to RoomStore in frontend/src/state/roomStore.ts — call API, then fetchRoom to refresh state
- [x] T029 [US2] Wire frontend/src/components/GuessForm.tsx to roomStore — on submit: trim input, reject empty with inline error, call roomStore.submitGuess(), clear input on success (FR-004, FR-005, FR-006)
- [x] T030 [US2] Hide or disable GuessForm for the drawer in frontend/src/pages/GamePage.tsx — only render guess form when viewer is a guesser (FR-004)
- [x] T031 [US2] Validate guess flow: correct guess → 100 pts; incorrect → 0 pts; empty → error; case-insensitive match works; " rocket " trimmed → correct (SC-002, SC-003)

**Checkpoint**: Guess submission works with full validation and scoring. Drawer cannot guess.

---

## Phase 5: User Story 3 — Guess History Synced via Polling (Priority: P1)

**Goal**: All players see shared guess history updated via polling. Each entry shows guesser name, text, and correctness.

**Independent Test**: Guesser submits guess → both tabs show it in history within ~2s.

### Implementation for User Story 3

- [x] T032 [US3] Add guess history display to frontend/src/pages/GamePage.tsx — render `room.guesses` as a chronological list showing guesser name, guess text, and a correct/incorrect indicator for each entry (FR-008, FR-009)
- [x] T033 [US3] Validate history sync: guesser submits guess → drawer and all guessers see it in history within ~2s → multiple guesses appear in chronological order (SC-004)

**Checkpoint**: Guess history visible to all players, synced via existing polling.

---

## Phase 6: User Story 4 — Score Tracking (Priority: P2)

**Goal**: Scoreboard displays all players with current scores. Scores start at 0, increase by 100 on correct guess.

**Independent Test**: Start game → all scores 0. Correct guess → guesser score shows 100.

### Implementation for User Story 4

- [x] T034 [US4] Update frontend/src/components/Scoreboard.tsx to display all participants with their scores from `room.scores` and role labels (Drawer/Guesser) derived from `room.drawerId` (FR-012, FR-013)
- [x] T035 [US4] Wire Scoreboard component in frontend/src/pages/GamePage.tsx — pass room data so Scoreboard reads participants, scores, and drawerId
- [x] T036 [US4] Validate scoreboard: game starts → all scores 0; correct guess → score 100; multiple correct guesses → score 200; incorrect → no change; all players see same scores (SC-003, SC-006)

**Checkpoint**: Scoreboard displays live scores for all participants. Deterministic scoring verified.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Build validation and end-to-end walkthrough.

- [x] T037 Run `npm run build` in backend/ and verify clean compilation
- [x] T038 Run `npm run build` in frontend/ and verify clean compilation
- [x] T039 Execute full quickstart.md walkthrough (steps 1-6) in two browser tabs to validate all acceptance scenarios end-to-end
- [x] T040 Verify role-based controls: drawer cannot submit guesses; guessers cannot draw on canvas; all enforced server-side (SC-005)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — canvas drawing
- **US2 (Phase 4)**: Depends on Phase 2 — guess submission; can run in parallel with US1 (different files)
- **US3 (Phase 5)**: Depends on US2 (needs guesses to display history)
- **US4 (Phase 6)**: Depends on US2 (needs scores to display)
- **Polish (Phase 7)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — independent of guess/score work
- **US2 (P1)**: Can start after Phase 2 — independent of canvas work
- **US3 (P1)**: Depends on US2 (guess history requires guess data)
- **US4 (P2)**: Depends on US2 (scoreboard requires score data)
- US1 and US2 can run in parallel (different backend functions, different frontend components)

### Parallel Opportunities

Phase 1:
```
T001-T006 — same file, sequential
```

Phase 2:
```
T007-T010 — backend sequential
T011 — frontend, parallel with T007-T010
```

Phase 3 + Phase 4 (after Phase 2):
```
US1 backend (T012-T016) | US2 backend (T024-T026)
US1 frontend (T017-T023) | US2 frontend (T027-T031)
— Different files, can proceed in parallel
```

Phase 5 + Phase 6 (after US2):
```
US3 (T032-T033) | US4 (T034-T036)
— Different components, can proceed in parallel
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Phase 1 + Phase 2: Setup types and game state init
2. Phase 3 (US1): Canvas drawing and sync
3. Phase 4 (US2): Guess submission and scoring
4. **STOP and VALIDATE**: Two-tab test — drawing syncs, guesses work with scoring

### Incremental Delivery

1. Setup + Foundational → Types and init ready → Commit
2. US1 → Canvas drawing + sync → Commit
3. US2 → Guess validation + scoring → Commit
4. US3 → Guess history display → Commit
5. US4 → Scoreboard → Commit
6. Polish → Build validation + walkthrough → Commit

---

## Notes

- 9 source files modified (game.ts, roomStore.ts, rooms.ts, schemas.ts, api.ts, roomStore.ts, GamePage.tsx, GuessForm.tsx, Scoreboard.tsx)
- 3 new API endpoints: draw, clear, guess
- Canvas uses normalized 0-1 coordinates for size-independent rendering
- US1 and US2 are fully parallelizable (different files, no dependencies)
- US3 and US4 are parallelizable after US2 completes
- Commit after each story per Constitution I (Incremental Delivery)
