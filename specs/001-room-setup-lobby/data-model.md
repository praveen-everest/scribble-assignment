# Data Model: Room Setup & Lobby

**Feature**: 001-room-setup-lobby
**Date**: 2026-06-02

## Entities

### Room

Represents a game session. Stored in-memory on the backend.

| Field | Type | Description |
|-------|------|-------------|
| code | string | Unique 4-character alphanumeric code (A-Z, 2-9, excluding I/O/S/L) |
| status | RoomStatus | Current room state: `"lobby"` or `"playing"` |
| hostId | string | Participant ID of the room creator (host) |
| participants | Participant[] | Ordered list of players in the room |
| createdAt | string | ISO 8601 timestamp of room creation |
| updatedAt | string | ISO 8601 timestamp of last state change |

**Changes from starter**:
- Added `hostId` field (new)
- Extended `RoomStatus` from `"lobby"` to `"lobby" | "playing"`

**Validation rules**:
- `code` is generated server-side, unique across all rooms
- `hostId` is set once at creation and never transferred
- `status` transitions: `"lobby"` → `"playing"` (one-way for this
  scenario; future scenarios add more transitions)
- `participants` has no maximum length

### Participant

Represents a player within a room.

| Field | Type | Description |
|-------|------|-------------|
| id | string | UUID generated server-side on join |
| name | string | Display name, trimmed, non-empty |
| joinedAt | string | ISO 8601 timestamp |

**Changes from starter**: None to the Participant model itself.

**Validation rules**:
- `name` MUST be non-empty after trimming whitespace
- `id` is unique within the room
- Duplicate names are allowed (uniqueness by `id`)

### RoomSnapshot (Response)

Response-safe projection of Room sent to clients.

| Field | Type | Description |
|-------|------|-------------|
| code | string | Room code |
| status | RoomStatus | Current status |
| hostId | string | Participant ID of the host |
| participants | Participant[] | All participants |
| availableWords | string[] | Seed word list |
| roles | ParticipantRole[] | Available roles |

**Changes from starter**:
- Added `hostId` field (new) — allows frontend to determine host
  identity and conditionally render UI

## State Transitions

```text
Room Lifecycle (Scenario 1 scope):

  [Room Created] ──► status: "lobby"
                        │
                        │  Host clicks "Start Game"
                        │  (requires: hostId match + ≥2 participants)
                        │
                        ▼
                     status: "playing"
```

## Relationships

- A Room has exactly one host (hostId → Participant.id)
- A Room has one or more Participants
- A Participant belongs to exactly one Room
- Host is always the first Participant (creator)
