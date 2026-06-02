# Quickstart: Room Setup & Lobby

**Feature**: 001-room-setup-lobby

## Prerequisites

- Node.js 18+ and npm 9+
- Two browser tabs for multiplayer testing

## Setup

```bash
# Terminal 1: Start the backend
cd backend
npm install
npm run dev
# → http://localhost:3001

# Terminal 2: Start the frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Validation Walkthrough

### 1. Create a Room (Host)

1. Open `http://localhost:5173` in Tab 1.
2. Click "Create Room".
3. Enter a player name (e.g., "Alice") and submit.
4. Verify: You land on the Lobby screen.
5. Verify: A 4-character room code is displayed.
6. Verify: "Alice" appears in the participant list with a "(Host)"
   label.
7. Verify: The "Start Game" button is visible but disabled with a
   message about needing more players.

### 2. Join the Room (Joiner)

1. Open `http://localhost:5173` in Tab 2.
2. Click "Join Room".
3. Enter a name (e.g., "Bob") and the room code from Tab 1.
4. Verify: You land on the Lobby screen.
5. Verify: Both "Alice (Host)" and "Bob" appear in the participant
   list.

### 3. Lobby Polling

1. In Tab 1, verify "Bob" appears automatically within ~2 seconds
   (no manual refresh needed).
2. Open Tab 3, join as "Charlie" with the same room code.
3. Verify: Tab 1 and Tab 2 both show "Charlie" within ~2 seconds.

### 4. Host Starts Game

1. In Tab 1 (Alice / Host), verify the "Start Game" button is now
   enabled (2+ players present).
2. In Tab 2 (Bob), verify no "Start Game" button exists — only a
   "Waiting for host to start" message.
3. In Tab 1, click "Start Game".
4. Verify: Tab 1 navigates to the Game screen.
5. Verify: Tab 2 navigates to the Game screen within ~2 seconds.

### 5. Edge Case Validation

1. Try creating a room with an empty name → expect an error
   message.
2. Try joining with an empty room code → expect an error message.
3. Try joining with code "ZZZZ" (non-existent) → expect "Room not
   found".
4. Try joining a room that has already started → expect "Game
   already in progress".
5. Try typing a lowercase room code → expect it to work (case-
   insensitive).

## Build Validation

```bash
cd backend && npm run build
cd frontend && npm run build
```

Both MUST pass before committing.
