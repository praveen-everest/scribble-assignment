# Data Model: Result, Restart & Final Validation

**Feature**: 004-result-restart
**Date**: 2026-06-02

## Extended Entities

### RoomStatus (extended)

```text
"lobby" | "playing" | "result"
```

New value: `"result"` — represents the end-of-round state where
all players view results before the host restarts.

### Room (extended from Scenario 3)

No new fields. Existing fields used differently per status:

| Field | In "lobby" | In "playing" | In "result" |
|-------|-----------|-------------|------------|
| drawerId | null | hostId | hostId (preserved) |
| secretWord | null | "rocket" | "rocket" (preserved) |
| strokes | [] | [...drawing data] | [...preserved] |
| guesses | [] | [...guess entries] | [...preserved] |
| scores | {} | {pid: N, ...} | {pid: N, ...preserved} |

On restart (result → lobby): drawerId=null, secretWord=null,
strokes=[], guesses=[], scores={}. Participants and hostId
preserved.

### RoomSnapshot (extended)

No new fields. Behavior change in `toRoomSnapshot()`:

| Status | secretWord visibility |
|--------|----------------------|
| lobby | null for all viewers |
| playing | word for drawer only; null for guessers |
| result | word for ALL viewers (revealed) |

## State Transitions

```text
Complete Room Lifecycle:

  [Room Created] → status: "lobby"
        │
        │  startGame() — host clicks Start
        │  Sets: drawerId, secretWord, scores init
        ▼
     status: "playing"
        │
        │  endRound() — host clicks End Round
        │  No state changes — preserves all game data
        ▼
     status: "result"
        │
        │  restart() — host clicks Play Again
        │  Clears: drawerId, secretWord, strokes, guesses, scores
        │  Preserves: participants, hostId, code
        ▼
     status: "lobby"  (cycle repeats)
```
