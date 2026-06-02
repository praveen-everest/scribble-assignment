# Quickstart: Gameplay Interaction

**Feature**: 003-gameplay-interaction

## Prerequisites

- Scenarios 1 and 2 fully implemented
- Node.js 18+, two browser tabs

## Setup

```bash
cd backend && npm run dev   # http://localhost:3001
cd frontend && npm run dev  # http://localhost:5173
```

## Validation Walkthrough

### 1. Start a Game

1. Tab 1: Create room as "Alice", Tab 2: Join as "Bob".
2. Tab 1: Start Game. Both tabs navigate to game screen.
3. Verify: Alice is Drawer, Bob is Guesser. All scores show 0.

### 2. Drawing on the Canvas

1. In Tab 1 (Alice / Drawer): Draw on the canvas with the mouse.
2. Verify strokes appear immediately on Alice's screen.
3. In Tab 2 (Bob / Guesser): Wait ~2 seconds.
4. Verify Bob's canvas shows Alice's drawing (synced via polling).
5. Verify Bob's canvas is read-only (cannot draw).

### 3. Clear Canvas

1. In Tab 1: Click "Clear Canvas".
2. Verify Alice's canvas is cleared.
3. In Tab 2: Wait ~2 seconds.
4. Verify Bob's canvas is also cleared.

### 4. Guess Submission

1. In Tab 2 (Bob / Guesser): Type "pizza" and submit.
2. Verify "pizza" appears in the guess history on both tabs.
3. Verify Bob's score remains 0 (incorrect guess).
4. In Tab 2: Type "rocket" and submit.
5. Verify "rocket" appears in history marked as correct.
6. Verify Bob's score shows 100.

### 5. Guess Validation

1. In Tab 2: Try submitting an empty guess → error message.
2. Try submitting " rocket " (with spaces) → correct (trimmed).
3. Try submitting "ROCKET" → correct (case-insensitive).

### 6. Role-Based Controls

1. In Tab 1 (Drawer): Verify no guess form is shown.
2. In Tab 2 (Guesser): Verify canvas is read-only.

## Build Validation

```bash
cd backend && npm run build
cd frontend && npm run build
```
