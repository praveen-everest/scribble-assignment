# Implementation Plan: Gameplay Interaction

**Branch**: `003-gameplay-interaction` | **Date**: 2026-06-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-gameplay-interaction/spec.md`

## Summary

Add canvas drawing (freehand + clear) with server-stored strokes
polled to guessers (~2s), a guess submission endpoint with trim +
case-insensitive comparison + 100/0 scoring, synced guess history,
and a live scoreboard. Enforce role-based access: drawer can't
guess, guessers can't draw. 3 new backend endpoints, ~9 files
modified.

## Technical Context

**Language/Version**: TypeScript 5.6

**Primary Dependencies**: Express 4.21, React 18.3, Zod 3.23

**Storage**: In-memory `Map<string, Room>`

**Testing**: Manual two-tab browser validation

**Target Platform**: Desktop browser, Node.js 18+

**Project Type**: Web application (frontend + REST backend)

**Performance Goals**: Canvas strokes visible to guessers ~2s,
guess history synced ~2s

**Constraints**: No WebSockets, no new dependencies, deterministic
scoring, server-side role enforcement

**Scale/Scope**: Lab exercise — single round, 2-5 players

## Constitution Check

| Principle | Pre-Phase 0 | Post-Phase 1 | Notes |
|-----------|-------------|--------------|-------|
| I. Incremental Delivery | PASS | PASS | 4 user stories → 4 slices |
| II. Deterministic Game Logic | PASS | PASS | Scoring = 100/0 fixed, case-insensitive compare, no randomness |
| III. AI-Assisted Discipline | PASS | PASS | All changes traceable to FRs |
| IV. Testing and Validation | PASS | PASS | Quickstart defines two-tab validation |
| V. Simplicity and Scope | PASS | PASS | Coordinate arrays for canvas, flat scores map, no new deps |

No violations.

## Project Structure

### Source Code (files to modify)

```text
backend/
├── src/
│   ├── models/
│   │   └── game.ts            # Add Guess, Point types; extend Room/RoomSnapshot
│   ├── services/
│   │   └── roomStore.ts       # Add addStroke(), clearCanvas(), submitGuess(); init scores in startGame()
│   └── api/
│       ├── rooms.ts           # Add 3 new route handlers (draw, clear, guess)
│       └── schemas.ts         # Add 3 new Zod schemas

frontend/
├── src/
│   ├── pages/
│   │   └── GamePage.tsx       # Canvas drawing, role-based UI, wire components
│   ├── components/
│   │   ├── GuessForm.tsx      # Wire to submitGuess API
│   │   └── Scoreboard.tsx     # Display scores from room state
│   ├── state/
│   │   └── roomStore.ts       # Add submitGuess(), addStroke(), clearCanvas()
│   └── services/
│       └── api.ts             # Update types, add 3 API methods
```

**9 files modified total. No new files.**

## Implementation Sequence

### Slice 1: Backend — Data Model + Score Init (FR-010, FR-014)

**Files**: `game.ts`, `roomStore.ts`
- Add `Point`, `Guess` interfaces to game.ts
- Add `strokes: Point[][]`, `guesses: Guess[]`, `scores: Record<string, number>` to Room and RoomSnapshot
- Initialize all three in `startGame()` (strokes=[], guesses=[], scores=all participants→0)
- Initialize as null/empty in `createRoom()`
- Update `toRoomSnapshot()` to include strokes, guesses, scores

### Slice 2: Backend — Canvas Endpoints (FR-001, FR-002, FR-003, FR-014, FR-015, FR-016)

**Files**: `schemas.ts`, `rooms.ts`, `roomStore.ts`
- Add `addStroke(code, participantId, stroke)` — validates drawer, appends stroke
- Add `clearCanvas(code, participantId)` — validates drawer, resets strokes
- Add Zod schemas for draw and clear requests
- Add `POST /rooms/:code/draw` and `POST /rooms/:code/clear` handlers

### Slice 3: Backend — Guess Endpoint (FR-004-FR-008, FR-011)

**Files**: `schemas.ts`, `rooms.ts`, `roomStore.ts`
- Add `submitGuess(code, participantId, text)` — validates guesser, trims, compares, scores, records
- Add Zod schema for guess request
- Add `POST /rooms/:code/guess` handler

### Slice 4: Frontend — API + Store Methods

**Files**: `api.ts`, `roomStore.ts`
- Update RoomSnapshot type with strokes, guesses, scores
- Add `api.draw()`, `api.clearCanvas()`, `api.submitGuess()`
- Add store methods: `addStroke()`, `clearCanvas()`, `submitGuess()`

### Slice 5: Frontend — Canvas Drawing (FR-001, FR-002, FR-003, FR-015)

**Files**: `GamePage.tsx`
- Replace placeholder canvas with HTML5 Canvas element
- Implement freehand drawing (mousedown/move/up) for drawer
- Send each stroke to server on mouseup
- Render strokes from room.strokes for guessers (read-only)
- Add Clear Canvas button for drawer
- Canvas is non-interactive for guessers

### Slice 6: Frontend — Guess Form + History (FR-004-FR-009)

**Files**: `GuessForm.tsx`, `GamePage.tsx`
- Wire GuessForm to `roomStore.submitGuess()`
- Add trim + empty validation client-side
- Hide guess form for drawer
- Display guess history list on game screen (name + text + correct indicator)

### Slice 7: Frontend — Scoreboard (FR-010-FR-013)

**Files**: `Scoreboard.tsx`, `GamePage.tsx`
- Display all participants with scores from `room.scores`
- Show Drawer/Guesser role labels
- Scores update via polling (already in place)

## Data Flow

```text
Drawing:
  Drawer mouseup → POST /rooms/:code/draw { participantId, stroke }
  → Server appends stroke to room.strokes → 200
  → Guesser polls GET /rooms/:code → receives strokes → renders on canvas

Clear:
  Drawer clicks Clear → POST /rooms/:code/clear { participantId }
  → Server clears room.strokes → 200
  → Guesser polls → receives empty strokes → clears canvas

Guess:
  Guesser submits → POST /rooms/:code/guess { participantId, text }
  → Server trims, compares case-insensitively → records guess
  → If correct: score += 100
  → 200 { guess: { ... correct: true/false } }
  → All players poll → see updated guesses + scores
```

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Large stroke payloads from complex drawings | Medium | Normalized 0-1 coordinates keep points small; lab-scope drawings are simple |
| Canvas rendering differences across browsers | Low | Simple 2D context line drawing is universally supported |
| Guess race conditions (concurrent submissions) | Low | In-memory store is single-threaded in Node.js; no concurrent write conflicts |
