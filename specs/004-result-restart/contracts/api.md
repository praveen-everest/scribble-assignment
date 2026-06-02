# API Contracts: Result, Restart & Final Validation

**Feature**: 004-result-restart
**Date**: 2026-06-02

## New Endpoints

### POST /rooms/:code/end-round — End Round (NEW)

Host ends the current round. Transitions playing → result.

**Request**:
```json
{
  "participantId": "uuid-of-host"
}
```

**Response 200**:
```json
{
  "room": {
    "code": "AB3K",
    "status": "result",
    "hostId": "uuid-of-host",
    "drawerId": "uuid-of-host",
    "secretWord": "rocket",
    "strokes": [...],
    "guesses": [...],
    "scores": { "uuid-of-host": 0, "uuid-of-bob": 100 },
    "participants": [...],
    "availableWords": [...],
    "roles": [...]
  }
}
```

Note: secretWord is now visible to all viewers (result status).

**Response 403** (not the host):
```json
{ "message": "Only the host can end the round" }
```

**Response 400** (room not in playing status):
```json
{ "message": "Round is not active" }
```

---

### POST /rooms/:code/restart — Restart to Lobby (NEW)

Host restarts the game. Transitions result → lobby. Clears round
state, preserves participants.

**Request**:
```json
{
  "participantId": "uuid-of-host"
}
```

**Response 200**:
```json
{
  "room": {
    "code": "AB3K",
    "status": "lobby",
    "hostId": "uuid-of-host",
    "drawerId": null,
    "secretWord": null,
    "strokes": [],
    "guesses": [],
    "scores": {},
    "participants": [
      { "id": "uuid-of-host", "name": "Alice", "joinedAt": "..." },
      { "id": "uuid-of-bob", "name": "Bob", "joinedAt": "..." }
    ],
    "availableWords": [...],
    "roles": [...]
  }
}
```

**Response 403** (not the host):
```json
{ "message": "Only the host can restart the game" }
```

**Response 400** (room not in result status):
```json
{ "message": "Game has not ended yet" }
```

## Updated Behavior

### GET /rooms/:code — Fetch Room State

Word visibility updated for "result" status:
- **lobby**: secretWord = null for all
- **playing**: secretWord = word for drawer, null for guessers
- **result**: secretWord = word for ALL viewers (revealed)

### POST /rooms/:code/join — Join Room

Rejection behavior extended:
- **playing**: 403 "Game already in progress"
- **result**: 403 "Game already in progress" (same message)
