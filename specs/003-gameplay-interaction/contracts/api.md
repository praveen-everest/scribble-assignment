# API Contracts: Gameplay Interaction

**Feature**: 003-gameplay-interaction
**Date**: 2026-06-02

## New Endpoints

### POST /rooms/:code/draw — Add Canvas Stroke (NEW)

Drawer sends a single stroke (mousedown→mousemove→mouseup).

**Request**:
```json
{
  "participantId": "uuid-of-drawer",
  "stroke": [
    { "x": 0.1, "y": 0.2 },
    { "x": 0.15, "y": 0.25 },
    { "x": 0.2, "y": 0.3 }
  ]
}
```

**Response 200**:
```json
{ "ok": true }
```

**Response 403** (not the drawer):
```json
{ "message": "Only the drawer can draw" }
```

**Response 400** (room not in playing status):
```json
{ "message": "Game is not active" }
```

---

### POST /rooms/:code/clear — Clear Canvas (NEW)

Drawer clears all strokes.

**Request**:
```json
{
  "participantId": "uuid-of-drawer"
}
```

**Response 200**:
```json
{ "ok": true }
```

**Response 403** (not the drawer):
```json
{ "message": "Only the drawer can clear the canvas" }
```

---

### POST /rooms/:code/guess — Submit Guess (NEW)

Guesser submits a text guess.

**Request**:
```json
{
  "participantId": "uuid-of-guesser",
  "text": "rocket"
}
```

**Response 200** (correct guess):
```json
{
  "guess": {
    "participantId": "uuid-of-guesser",
    "playerName": "Bob",
    "text": "rocket",
    "correct": true,
    "timestamp": "2026-06-02T12:00:00.000Z"
  }
}
```

**Response 200** (incorrect guess):
```json
{
  "guess": {
    "participantId": "uuid-of-guesser",
    "playerName": "Bob",
    "text": "pizza",
    "correct": false,
    "timestamp": "2026-06-02T12:00:01.000Z"
  }
}
```

**Response 400** (empty/whitespace guess):
```json
{ "message": "Guess cannot be empty" }
```

**Response 403** (drawer trying to guess):
```json
{ "message": "The drawer cannot submit guesses" }
```

**Response 400** (room not in playing status):
```json
{ "message": "Game is not active" }
```

---

## Updated Endpoints

### GET /rooms/:code — Fetch Room State (UPDATED)

Now includes strokes, guesses, and scores when room is playing.

**Response 200 (playing status)**:
```json
{
  "room": {
    "code": "AB3K",
    "status": "playing",
    "hostId": "uuid-of-host",
    "drawerId": "uuid-of-host",
    "secretWord": null,
    "strokes": [
      [{ "x": 0.1, "y": 0.2 }, { "x": 0.2, "y": 0.3 }],
      [{ "x": 0.5, "y": 0.5 }, { "x": 0.6, "y": 0.7 }]
    ],
    "guesses": [
      {
        "participantId": "uuid-of-bob",
        "playerName": "Bob",
        "text": "pizza",
        "correct": false,
        "timestamp": "2026-06-02T12:00:00.000Z"
      }
    ],
    "scores": {
      "uuid-of-host": 0,
      "uuid-of-bob": 0
    },
    "participants": [...],
    "availableWords": [...],
    "roles": [...]
  }
}
```

Note: `strokes`, `guesses`, and `scores` are the same for all
viewers (no viewer-based filtering). `secretWord` remains
drawer-only filtered.
