# Research: Gameplay Interaction

**Feature**: 003-gameplay-interaction
**Date**: 2026-06-02

## Findings

### 1. Canvas Data Storage Strategy

**Decision**: Store canvas strokes as an array of line segments on
the Room. Each stroke is an array of `{x, y}` coordinate points
captured during a single mousedown→mousemove→mouseup gesture.

**Rationale**: Storing raw coordinate arrays is the simplest
representation that can be rendered on any HTML canvas. It avoids
base64 image encoding (heavy payloads) and complex vector formats.
Coordinates are normalized to canvas dimensions (0-1 range) so
rendering is size-independent.

**Alternatives considered**:
- Base64-encoded canvas image → rejected because payload size
  grows with canvas resolution and polling would be expensive.
- SVG paths → rejected as unnecessary complexity for freehand.

### 2. Canvas Sync Mechanism

**Decision**: The drawer POSTs individual strokes to the server
via `POST /rooms/:code/draw`. Guessers receive all strokes in the
`GET /rooms/:code` snapshot on each ~2s poll. The drawer clears
via `POST /rooms/:code/clear`.

**Rationale**: Sending one stroke per POST keeps payloads small.
The GET response returns the full stroke array, which guessers
render in sequence. This reuses the existing polling pattern
with no new infrastructure.

**Alternatives considered**:
- Full canvas state on every POST → rejected because it sends
  redundant data on every stroke.
- WebSocket push → rejected per README out-of-scope.

### 3. Guess Submission Flow

**Decision**: Add `POST /rooms/:code/guess` endpoint. Body
includes `participantId` and `text`. Server trims text, rejects
empty, compares case-insensitively to `secretWord`, records guess
with correctness flag, and updates score.

**Rationale**: A dedicated endpoint keeps guess logic server-side
per Constitution II (Deterministic Game Logic). Client-side
validation (trim, empty check) provides immediate UX feedback;
server is the source of truth for scoring.

### 4. Score Storage

**Decision**: Store scores as a `Record<string, number>` on Room
mapping `participantId → score`. Initialize all participants to 0
in `startGame()`. Increment by 100 on correct guess.

**Rationale**: A flat map is the simplest structure for per-player
scores. Initializing in `startGame()` ensures scores exist before
any guess is submitted. This avoids null checks downstream.

### 5. Guess History Storage

**Decision**: Store guesses as an ordered array of `Guess` objects
on Room. Each Guess contains: `participantId`, `playerName`,
`text`, `correct` (boolean), `timestamp`. Guesses are appended
chronologically.

**Rationale**: An append-only array naturally preserves insertion
order. Including `playerName` avoids the need for clients to join
guess data with participant data. The `correct` flag enables
immediate UI feedback without client-side comparison.

### 6. Role-Based Access Control

**Decision**: Enforce at the API level: guess endpoint rejects
requests from the drawer (403). Canvas draw/clear endpoints reject
requests from non-drawers (403). Frontend hides/disables controls
based on role as a UX convenience; server is the enforcement point.

**Rationale**: Server-side enforcement prevents cheating via direct
API calls. Frontend control hiding is a UX aid, not a security
mechanism.
