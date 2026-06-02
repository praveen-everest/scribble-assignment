# Implementation Plan: Result, Restart & Final Validation

**Branch**: `004-result-restart` | **Date**: 2026-06-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-result-restart/spec.md`

## Summary

Add "result" room status to complete the game lifecycle. The host
ends the round (playing→result) to reveal the word, scores, and
history to all players. The host restarts (result→lobby) clearing
all round state while preserving participants. Update
toRoomSnapshot to reveal the secret word during result status.
Add 2 new endpoints and update the GamePage with result/restart UI.

## Technical Context

**Language/Version**: TypeScript 5.6

**Primary Dependencies**: Express 4.21, React 18.3, Zod 3.23

**Storage**: In-memory `Map<string, Room>`

**Testing**: Manual two-tab browser validation

**Target Platform**: Desktop browser, Node.js 18+

**Project Type**: Web application (frontend + REST backend)

**Performance Goals**: Result screen visible ~2s after host ends;
lobby visible ~2s after restart

**Constraints**: No new dependencies, host-only controls, polling

**Scale/Scope**: Lab exercise — single round, 2-5 players

## Constitution Check

| Principle | Pre-Phase 0 | Post-Phase 1 | Notes |
|-----------|-------------|--------------|-------|
| I. Incremental Delivery | PASS | PASS | 3 user stories → 3 slices |
| II. Deterministic Game Logic | PASS | PASS | Same word/drawer on replay |
| III. AI-Assisted Discipline | PASS | PASS | All changes traceable to FRs |
| IV. Testing and Validation | PASS | PASS | Quickstart covers full loop |
| V. Simplicity and Scope | PASS | PASS | 1 new status value, 2 endpoints |

No violations.

## Project Structure

### Source Code (files to modify)

```text
backend/
├── src/
│   ├── models/
│   │   └── game.ts            # Extend RoomStatus with "result"
│   ├── services/
│   │   └── roomStore.ts       # Add endRound(), restart(); update toRoomSnapshot word visibility
│   └── api/
│       ├── rooms.ts           # Add 2 new route handlers; update join rejection
│       └── schemas.ts         # Add 2 new Zod schemas

frontend/
├── src/
│   ├── pages/
│   │   ├── GamePage.tsx       # Result UI, End Round button, Play Again button
│   │   └── LobbyPage.tsx      # Handle result→lobby transition on poll
│   ├── state/
│   │   └── roomStore.ts       # Add endRound(), restart() store methods
│   └── services/
│       └── api.ts             # Update status type, add 2 API methods
```

**7 files modified. No new files.**

## Implementation Sequence

### Slice 1: Backend — Result Status + End Round (FR-001, FR-002, FR-005)

**Files**: `game.ts`, `roomStore.ts`, `schemas.ts`, `rooms.ts`
- Extend RoomStatus to include `"result"`
- Add `endRound(code, participantId)` — validates host + playing status, transitions to "result"
- Update `toRoomSnapshot()` — reveal secretWord to all viewers when status is "result"
- Add Zod schema + POST /rooms/:code/end-round handler

### Slice 2: Backend — Restart to Lobby (FR-006, FR-007, FR-008, FR-009)

**Files**: `roomStore.ts`, `schemas.ts`, `rooms.ts`
- Add `restart(code, participantId)` — validates host + result status, transitions to "lobby", clears drawerId, secretWord, strokes, guesses, scores; preserves participants
- Add Zod schema + POST /rooms/:code/restart handler
- Update join handler to reject "result" status (FR-011)

### Slice 3: Frontend — Result Screen + Restart (FR-002-FR-006, FR-010)

**Files**: `api.ts`, `roomStore.ts`, `GamePage.tsx`, `LobbyPage.tsx`
- Update RoomSnapshot status type to include "result"
- Add `api.endRound()`, `api.restart()` methods
- Add store methods: `endRound()`, `restart()`
- GamePage: when status="result", show revealed word for all, final scores, full history, host-only "Play Again" button, non-host waiting message, host-only "End Round" button during playing
- GamePage: on restart detection (status changes to "lobby"), navigate to /lobby
- LobbyPage: no changes needed — it already handles lobby status

## Data Flow

```text
End Round:
  Host clicks "End Round" → POST /rooms/:code/end-round
  → Backend validates host + playing → sets status="result"
  → Response includes secretWord for all viewers
  → Host sees result screen immediately
  → Non-host poll detects status="result" → show result screen

Restart:
  Host clicks "Play Again" → POST /rooms/:code/restart
  → Backend validates host + result → sets status="lobby"
  → Clears drawerId, secretWord, strokes, guesses, scores
  → Preserves participants + hostId
  → Host navigates to /lobby
  → Non-host poll detects status="lobby" → navigate to /lobby
```

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Non-host clicks End Round/Play Again | Low | Server validates host; frontend hides buttons for non-host |
| Guess submitted during end-round transition | Low | submitGuess validates room.status === "playing" |
| Multiple rapid restarts | Low | Each restart validates status="result"; second call returns error |
