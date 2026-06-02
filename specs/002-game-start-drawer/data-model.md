# Data Model: Game Start & Drawer Flow

**Feature**: 002-game-start-drawer
**Date**: 2026-06-02

## Entities

### Room (extended from Scenario 1)

| Field | Type | Description |
|-------|------|-------------|
| code | string | Unique 4-character room code |
| status | RoomStatus | `"lobby"` or `"playing"` |
| hostId | string | Participant ID of room creator |
| drawerId | string \| null | Participant ID of the drawer (null while in lobby) |
| secretWord | string \| null | The secret word for the current round (null while in lobby) |
| participants | Participant[] | Ordered list of players |
| createdAt | string | ISO 8601 timestamp |
| updatedAt | string | ISO 8601 timestamp |

**Changes from Scenario 1**:
- Added `drawerId` (new) — set to `hostId` when game starts
- Added `secretWord` (new) — set to `STARTER_WORDS[0]` when game starts

**Initialization rules**:
- Both `drawerId` and `secretWord` are `null` when the room is
  created (lobby status)
- Both are set atomically in `startGame()` when status transitions
  to `"playing"`

### RoomSnapshot (extended — response projection)

| Field | Type | Description |
|-------|------|-------------|
| code | string | Room code |
| status | RoomStatus | Current status |
| hostId | string | Host participant ID |
| drawerId | string \| null | Drawer participant ID (null in lobby) |
| secretWord | string \| null | Secret word — included only for the drawer; null for guessers and in lobby |
| participants | Participant[] | All participants |
| availableWords | string[] | Seed word list |
| roles | ParticipantRole[] | Available role types |

**Changes from Scenario 1**:
- Added `drawerId` (new) — always included when room is playing
- Added `secretWord` (new) — **viewer-filtered**: included only
  when `viewerParticipantId === room.drawerId`. Set to `null` for
  all other viewers.

### Participant (unchanged)

| Field | Type | Description |
|-------|------|-------------|
| id | string | UUID |
| name | string | Display name, trimmed |
| joinedAt | string | ISO 8601 timestamp |

No changes to the Participant model. Roles (drawer/guesser) are
derived on the frontend from `room.drawerId`, not stored per
participant.

## State Transitions

```text
Room Lifecycle (Scenario 2 additions):

  status: "lobby"
    drawerId: null
    secretWord: null
         │
         │  startGame() — host clicks Start
         │  Sets: drawerId = hostId
         │  Sets: secretWord = STARTER_WORDS[0]
         │
         ▼
  status: "playing"
    drawerId: hostId
    secretWord: "rocket"
```

## Word Visibility Matrix

| Viewer | Room Status | secretWord in response |
|--------|-------------|----------------------|
| Any player | lobby | null |
| Drawer | playing | "rocket" (actual word) |
| Guesser | playing | null |
