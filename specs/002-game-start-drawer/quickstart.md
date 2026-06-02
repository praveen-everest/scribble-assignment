# Quickstart: Game Start & Drawer Flow

**Feature**: 002-game-start-drawer

## Prerequisites

- Scenario 1 (Room Setup & Lobby) fully implemented
- Node.js 18+ and npm 9+
- Two browser tabs for multiplayer testing

## Setup

```bash
cd backend && npm run dev   # http://localhost:3001
cd frontend && npm run dev  # http://localhost:5173
```

## Validation Walkthrough

### 1. Create Room and Start Game

1. Open Tab 1 → Create Room as "Alice".
2. Open Tab 2 → Join the same room as "Bob".
3. In Tab 1 (host), click "Start Game".
4. Both tabs should navigate to the game screen.

### 2. Verify Drawer Assignment

1. In Tab 1 (Alice / Host), verify:
   - Alice is labeled as "Drawer" on the game screen.
   - The participant list shows Alice as Drawer and Bob as
     Guesser.
2. In Tab 2 (Bob / Joiner), verify:
   - Alice is labeled as "Drawer" on the game screen.
   - Bob is labeled as "Guesser".
   - Both tabs show the same drawer/guesser assignment.

### 3. Verify Secret Word Visibility

1. In Tab 1 (Alice / Drawer), verify:
   - The secret word "rocket" is displayed prominently
     (e.g., "Your word: rocket").
2. In Tab 2 (Bob / Guesser), verify:
   - No secret word is visible.
   - A placeholder message is shown (e.g., "Guess the word!").

### 4. Verify Deterministic Word Selection

1. Create a new room in a fresh tab pair.
2. Start a new game.
3. Verify the word is "rocket" again — same word every time.

### 5. Verify Polling

1. Both tabs should poll for game state (~2 seconds).
2. The game screen should remain stable with no errors during
   polling.

## Build Validation

```bash
cd backend && npm run build
cd frontend && npm run build
```

Both MUST pass before committing.
