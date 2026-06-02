# Data Model: Gameplay Interaction

**Feature**: 003-gameplay-interaction
**Date**: 2026-06-02

## New Entities

### Guess

A single guess submission by a guesser.

| Field | Type | Description |
|-------|------|-------------|
| participantId | string | ID of the guesser who submitted |
| playerName | string | Display name of the guesser |
| text | string | The guess text (trimmed) |
| correct | boolean | Whether the guess matched the secret word |
| timestamp | string | ISO 8601 timestamp of submission |

### Point

A single coordinate in a canvas stroke.

| Field | Type | Description |
|-------|------|-------------|
| x | number | X coordinate (0-1 normalized) |
| y | number | Y coordinate (0-1 normalized) |

## Extended Entities

### Room (extended from Scenario 2)

New fields added:

| Field | Type | Description |
|-------|------|-------------|
| strokes | Point[][] | Array of line segments; each stroke is an array of points |
| guesses | Guess[] | Chronologically ordered list of all guesses |
| scores | Record<string, number> | Map of participantId → current score |

**Initialization in startGame()**:
- `strokes`: `[]` (empty array)
- `guesses`: `[]` (empty array)
- `scores`: All participant IDs mapped to `0`

### RoomSnapshot (extended)

New fields added to the response projection:

| Field | Type | Description |
|-------|------|-------------|
| strokes | Point[][] | Full canvas strokes (same for all viewers) |
| guesses | Guess[] | Full guess history (same for all viewers) |
| scores | Record<string, number> | All player scores (same for all viewers) |

All three fields are returned to ALL viewers equally (no
viewer-based filtering — unlike secretWord).

## State Mutations

```text
POST /rooms/:code/draw (drawer only):
  room.strokes.push(newStroke)
  room.updatedAt = now()

POST /rooms/:code/clear (drawer only):
  room.strokes = []
  room.updatedAt = now()

POST /rooms/:code/guess (guesser only):
  trimmedText = text.trim()
  correct = trimmedText.toLowerCase() === room.secretWord.toLowerCase()
  room.guesses.push({ participantId, playerName, text: trimmedText, correct, timestamp })
  if (correct) room.scores[participantId] += 100
  room.updatedAt = now()
```
