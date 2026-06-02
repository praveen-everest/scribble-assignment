# Quickstart: Result, Restart & Final Validation

**Feature**: 004-result-restart

## Prerequisites

- Scenarios 1, 2, and 3 fully implemented
- Node.js 18+, two browser tabs

## Setup

```bash
cd backend && npm run dev   # http://localhost:3001
cd frontend && npm run dev  # http://localhost:5173
```

## Validation Walkthrough

### 1. Play a Round

1. Tab 1: Create room as "Alice", Tab 2: Join as "Bob".
2. Tab 1: Start Game. Both navigate to game screen.
3. Tab 1 (Drawer): Draw something on the canvas.
4. Tab 2 (Guesser): Submit "rocket" → correct, score 100.

### 2. End the Round

1. In Tab 1 (Host/Drawer): Click "End Round".
2. Both tabs should show the result screen.
3. Verify: The word "rocket" is now visible to both players.
4. Verify: Final scores show Alice: 0, Bob: 100.
5. Verify: Full guess history with Bob's correct guess.
6. Verify: Tab 2 (Bob) does NOT have an End Round or Play Again
   button — only the host has these controls.

### 3. Restart to Lobby

1. In Tab 1 (Host): Click "Play Again".
2. Both tabs should return to the lobby.
3. Verify: Both Alice and Bob are still in the participant list.
4. Verify: The lobby shows normal lobby state — no game data.

### 4. Play Again

1. In Tab 1: Click "Start Game" again.
2. Verify: A new round starts with Alice as drawer, word "rocket".
3. Verify: Canvas is blank, no guess history, all scores 0.

### 5. Full Game Loop

1. Complete the full cycle: lobby → game → result → lobby → game.
2. Verify no errors at any transition point.
3. Verify both tabs stay in sync throughout.

## Build Validation

```bash
cd backend && npm run build
cd frontend && npm run build
```
