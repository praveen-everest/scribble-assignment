# API Contracts: Game Start & Drawer Flow

**Feature**: 002-game-start-drawer
**Date**: 2026-06-02

## Changed Endpoints

### POST /rooms/:code/start — Start Game (UPDATED)

Now initializes game state in addition to status transition.

**Request** (unchanged):
```json
{
  "participantId": "uuid-of-host"
}
```

**Response 200** (updated — now includes drawerId + secretWord):
```json
{
  "room": {
    "code": "AB3K",
    "status": "playing",
    "hostId": "uuid-of-host",
    "drawerId": "uuid-of-host",
    "secretWord": "rocket",
    "participants": [
      { "id": "uuid-of-host", "name": "Alice", "joinedAt": "..." },
      { "id": "uuid-of-bob", "name": "Bob", "joinedAt": "..." }
    ],
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

Note: The host who starts the game is always the drawer, so
`secretWord` is included in this response (viewer = drawer).

Error responses unchanged from Scenario 1.

---

### GET /rooms/:code — Fetch Room State (UPDATED)

Now returns viewer-filtered game state when room is playing.

**Query params**:
- `participantId` (string, optional): Used to determine word
  visibility. If the viewer is the drawer, `secretWord` is
  included. Otherwise `secretWord` is `null`.

**Response 200 (drawer viewing)**:
```json
{
  "room": {
    "code": "AB3K",
    "status": "playing",
    "hostId": "uuid-of-host",
    "drawerId": "uuid-of-host",
    "secretWord": "rocket",
    "participants": [...],
    "availableWords": [...],
    "roles": [...]
  }
}
```

**Response 200 (guesser viewing)**:
```json
{
  "room": {
    "code": "AB3K",
    "status": "playing",
    "hostId": "uuid-of-host",
    "drawerId": "uuid-of-host",
    "secretWord": null,
    "participants": [...],
    "availableWords": [...],
    "roles": [...]
  }
}
```

**Response 200 (lobby status — unchanged)**:
```json
{
  "room": {
    "code": "AB3K",
    "status": "lobby",
    "hostId": "uuid-of-host",
    "drawerId": null,
    "secretWord": null,
    "participants": [...],
    "availableWords": [...],
    "roles": [...]
  }
}
```
