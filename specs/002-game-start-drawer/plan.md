# Implementation Plan: Game Start & Drawer Flow

**Branch**: `002-game-start-drawer` | **Date**: 2026-06-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-game-start-drawer/spec.md`

## Summary

Extend the backend Room model with `drawerId` and `secretWord`
fields. Initialize both in `startGame()` — drawer is always the
host, word is always `STARTER_WORDS[0]` ("rocket"). Implement
viewer-based word filtering in `toRoomSnapshot()` using the
existing `viewerParticipantId` parameter. Update the GamePage
with role-based UI (drawer sees word, guesser sees placeholder),
participant roles display, and ~2s polling.

## Technical Context

**Language/Version**: TypeScript 5.6 (both frontend and backend)

**Primary Dependencies**: Express 4.21, React 18.3, Zod 3.23

**Storage**: In-memory `Map<string, Room>`

**Testing**: Manual two-tab browser validation

**Target Platform**: Desktop browser, Node.js 18+

**Project Type**: Web application (frontend + REST backend)

**Performance Goals**: Game screen loads with drawer info < 3s

**Constraints**: No new dependencies, deterministic word selection,
server-side word filtering

**Scale/Scope**: Lab exercise — single round, 2-5 players

## Constitution Check

| Principle | Pre-Phase 0 | Post-Phase 1 | Notes |
|-----------|-------------|--------------|-------|
| I. Incremental Delivery | PASS | PASS | 3 user stories map to 3 slices |
| II. Deterministic Game Logic | PASS | PASS | Word = STARTER_WORDS[0], drawer = hostId |
| III. AI-Assisted Discipline | PASS | PASS | All changes traceable to spec FRs |
| IV. Testing and Validation | PASS | PASS | Quickstart defines two-tab validation |
| V. Simplicity and Scope | PASS | PASS | 2 new fields on Room, no new deps |

No violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-game-start-drawer/
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

### Source Code (files to modify)

```text
backend/
├── src/
│   ├── models/
│   │   └── game.ts            # Add drawerId, secretWord to Room + RoomSnapshot
│   └── services/
│       └── roomStore.ts       # Initialize game state in startGame(), filter word in toRoomSnapshot()

frontend/
├── src/
│   ├── pages/
│   │   └── GamePage.tsx       # Role-based UI, word display, polling
│   └── services/
│       └── api.ts             # Add drawerId, secretWord to RoomSnapshot type
```

**Structure Decision**: Extends existing files only. No new files
needed. 4 files modified total.

## Implementation Sequence

### Slice 1: Backend — Game State Initialization (FR-001, FR-002, FR-004)

**Files changed**:
- `backend/src/models/game.ts` — Add `drawerId: string | null`
  and `secretWord: string | null` to `Room` and `RoomSnapshot`
- `backend/src/services/roomStore.ts` — In `startGame()`, set
  `drawerId = hostId` and `secretWord = STARTER_WORDS[0]`.
  In `createRoom()`, initialize both as `null`.

**Validation**: Start game via API → response includes
`drawerId` and `secretWord`.

### Slice 2: Backend — Word Visibility Filtering (FR-005)

**Files changed**:
- `backend/src/services/roomStore.ts` — In `toRoomSnapshot()`,
  check if `viewerParticipantId === room.drawerId`. If yes,
  include `secretWord`. If no, set to `null`. Include `drawerId`
  always.

**Validation**: GET /rooms/:code with drawer's participantId →
includes word. With guesser's participantId → word is null.

### Slice 3: Frontend — Game Screen Update (FR-003, FR-006, FR-007)

**Files changed**:
- `frontend/src/services/api.ts` — Add `drawerId: string | null`
  and `secretWord: string | null` to `RoomSnapshot` type
- `frontend/src/pages/GamePage.tsx` — Add polling (~2s), show
  secret word for drawer ("Your word: rocket"), show "Guess the
  word!" for guessers, display participant list with Drawer/Guesser
  role labels, handle poll errors with Reconnect button

**Validation**: Two-tab test per quickstart steps 1-5.

## Data Flow

```text
Start Game:
  Host clicks Start → POST /rooms/:code/start { participantId }
  → Backend: validate host + ≥2 players + lobby status
  → Set drawerId = hostId, secretWord = STARTER_WORDS[0]
  → Set status = "playing"
  → Return snapshot (word included — viewer is drawer)
  → Host navigates to /game, sees word

Game Screen Poll (Drawer):
  GET /rooms/:code?participantId=<drawerId>
  → toRoomSnapshot checks viewer === drawerId → true
  → Returns secretWord: "rocket"
  → Drawer sees "Your word: rocket"

Game Screen Poll (Guesser):
  GET /rooms/:code?participantId=<guesserId>
  → toRoomSnapshot checks viewer === drawerId → false
  → Returns secretWord: null
  → Guesser sees "Guess the word!"
```

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Guesser polls without participantId → sees word | Medium | toRoomSnapshot returns null when viewerParticipantId is missing or doesn't match drawerId |
| Existing tests break due to new null fields | Low | createRoom() initializes drawerId/secretWord as null; snapshot always includes them |
