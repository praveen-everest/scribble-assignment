# API Contracts: Room Setup & Lobby

**Feature**: 001-room-setup-lobby
**Date**: 2026-06-02

## Endpoints

### POST /rooms — Create Room

Creates a new room and assigns the creator as host.

**Request**:
```json
{
  "playerName": "Alice"
}
```
- `playerName` (string, required): Non-empty after trim.

**Response 201**:
```json
{
  "participantId": "uuid-of-alice",
  "room": {
    "code": "AB3K",
    "status": "lobby",
    "hostId": "uuid-of-alice",
    "participants": [
      { "id": "uuid-of-alice", "name": "Alice", "joinedAt": "2026-06-02T10:00:00.000Z" }
    ],
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

**Response 400** (empty/whitespace name):
```json
{
  "message": "Player name is required"
}
```

---

### POST /rooms/:code/join — Join Room

Adds a player to an existing room in lobby status.

**Request**:
```json
{
  "playerName": "Bob"
}
```
- `playerName` (string, required): Non-empty after trim.
- `:code` (path param): Case-insensitive, uppercased server-side.

**Response 200**:
```json
{
  "participantId": "uuid-of-bob",
  "room": {
    "code": "AB3K",
    "status": "lobby",
    "hostId": "uuid-of-alice",
    "participants": [
      { "id": "uuid-of-alice", "name": "Alice", "joinedAt": "..." },
      { "id": "uuid-of-bob", "name": "Bob", "joinedAt": "..." }
    ],
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

**Response 400** (empty/whitespace name or empty code):
```json
{
  "message": "Player name is required"
}
```

**Response 404** (room not found):
```json
{
  "message": "Room not found"
}
```

**Response 403** (game already started):
```json
{
  "message": "Game already in progress"
}
```

---

### GET /rooms/:code — Fetch Room State

Returns current room snapshot. Used for polling.

**Query params**:
- `participantId` (string, optional): Viewer context (reserved
  for future word-visibility filtering).

**Response 200**:
```json
{
  "room": {
    "code": "AB3K",
    "status": "lobby",
    "hostId": "uuid-of-alice",
    "participants": [...],
    "availableWords": [...],
    "roles": [...]
  }
}
```

**Response 404** (room not found):
```json
{
  "message": "Room not found"
}
```

---

### POST /rooms/:code/start — Start Game (NEW)

Transitions room from lobby to playing. Host-only action.

**Request**:
```json
{
  "participantId": "uuid-of-alice"
}
```
- `participantId` (string, required): Must match room's `hostId`.

**Response 200**:
```json
{
  "room": {
    "code": "AB3K",
    "status": "playing",
    "hostId": "uuid-of-alice",
    "participants": [...],
    "availableWords": [...],
    "roles": [...]
  }
}
```

**Response 403** (not the host):
```json
{
  "message": "Only the host can start the game"
}
```

**Response 400** (not enough players):
```json
{
  "message": "At least 2 players are required to start"
}
```

**Response 400** (room not in lobby):
```json
{
  "message": "Game has already started"
}
```

**Response 404** (room not found):
```json
{
  "message": "Room not found"
}
```
