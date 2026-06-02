# Reflection Report

## What did the starter app already have?

The starter provided a runnable but intentionally incomplete Scribble-style
guessing game scaffold:

- **Frontend**: Vite + React + TypeScript app shell with page routing, a
  branded landing page, Create Room and Join Room forms, a Lobby page with
  a manual refresh button, and a Game page with placeholder components
  (canvas, scoreboard, guess form, result panel).
- **Backend**: Node.js + Express + TypeScript service with in-memory room
  storage, three endpoints (POST /rooms, POST /rooms/:code/join,
  GET /rooms/:code), and Zod-based request validation.
- **Seed data**: A word list (`rocket`, `pizza`, `castle`, `guitar`,
  `sunflower`) and role types (`drawer`, `guesser`).
- **Known gaps**: No host concept, no automatic polling, no game start
  logic, no drawer assignment, no drawing interaction, no guess
  submission, no scoring, no result screen, no restart flow.
- **Known bug**: The frontend API base URL defaulted to
  `http://localhost:3001/bug` instead of `http://localhost:3001`.

## What did I add?

### Scenario 1 — Room Setup & Lobby (36 tasks)

- Added `hostId` to the Room model so the room creator is tracked as the
  host.
- Made player name required with trim + empty rejection (server and
  client).
- Added join validation: empty/whitespace codes rejected, case-insensitive
  lookup, non-lobby rooms rejected with "Game already in progress."
- Replaced the manual refresh button with automatic ~2s polling using
  `setInterval` + cleanup on unmount.
- Added poll error handling with a Reconnect button.
- Added host-only "Start Game" button (disabled until 2+ players),
  non-host waiting message.
- Added `POST /rooms/:code/start` endpoint with host/count/status
  validation.
- Fixed the frontend API base URL bug.

### Scenario 2 — Game Start & Drawer Flow (22 tasks)

- Added `drawerId` and `secretWord` fields to Room, initialized in
  `startGame()` (drawer = host, word = `STARTER_WORDS[0]`).
- Implemented viewer-based word filtering in `toRoomSnapshot()` — the
  secret word is returned only to the drawer during "playing" status.
- Updated the Game page to show the drawer's identity, role labels
  (Drawer/Guesser) for all participants, the secret word for the drawer,
  and "Guess the word!" for guessers.
- Added ~2s polling on the Game page with Reconnect on error.

### Scenario 3 — Gameplay Interaction (40 tasks)

- Added `Point`, `Guess` types and `strokes`, `guesses`, `scores` fields
  to Room.
- Implemented freehand canvas drawing with HTML5 Canvas (normalized 0-1
  coordinates, mousedown/move/up events).
- Canvas strokes are sent to the server per stroke and synced to guessers
  via REST polling (~2s).
- Added Clear Canvas (drawer only, server-side validation).
- Added `POST /rooms/:code/guess` endpoint: trims input, rejects empty,
  compares case-insensitively, scores 100 for correct / 0 for incorrect.
- Wired the GuessForm component with client-side validation and server
  submission.
- Added guess history display (name, text, correct/wrong indicator) synced
  to all players via polling.
- Built a live Scoreboard showing all participants with scores and roles.
- Enforced role-based access: drawer cannot guess (server 403), guessers
  cannot draw (mouse events disabled + server 403).

### Scenario 4 — Result, Restart & Final Validation (27 tasks)

- Added "result" room status to complete the state machine
  (lobby → playing → result → lobby).
- Added `POST /rooms/:code/end-round` (host only, playing → result).
- On result screen: secret word revealed to all players, final scores
  displayed, full guess history visible.
- Added `POST /rooms/:code/restart` (host only, result → lobby) —
  clears drawerId, secretWord, strokes, guesses, scores; preserves
  participants and hostId.
- Non-host players see "Waiting for host to restart" and are automatically
  redirected to the lobby on poll detecting status change.
- Full game loop validated: lobby → game → result → lobby → game again.

## Decisions and tradeoffs

- **REST polling over WebSockets**: The README explicitly banned
  WebSockets. All multiplayer sync (lobby participants, canvas strokes,
  guess history, scores, status transitions) uses ~2s REST polling. This
  introduces a deliberate ~2s latency for non-initiating players but keeps
  the architecture simple and within scope.
- **Canvas sync via polling**: Drawing strokes are stored as coordinate
  arrays on the server and polled by guessers. This was a clarification
  decision — without canvas sync, guessers would guess blind.
  Normalized 0-1 coordinates keep payloads small and rendering
  size-independent.
- **Deterministic game logic**: Word selection always uses
  `STARTER_WORDS[0]` ("rocket"). Drawer is always the host. Scoring is
  fixed at 100/0. No randomness anywhere, per Constitution Principle II.
- **Flat Room model**: Instead of a separate Round entity, game state
  (drawerId, secretWord, strokes, guesses, scores) lives directly on
  Room. This is simpler for single-round scope and avoids unnecessary
  nesting.
- **Server-side role enforcement**: The drawer cannot submit guesses and
  guessers cannot draw — enforced at the API level with 403 responses.
  Frontend control hiding is a UX convenience, not the security boundary.
- **Participant ID in memory**: Per clarification, participant IDs are
  held in application memory only. Refreshing the page loses identity.
  This is a known limitation accepted for lab scope.

## AI usage

- AI (Claude) was used for all Spec Kit artifact generation (constitution,
  specs, plans, tasks, analysis) and all implementation code.
- Every AI-generated code change was reviewed against the current spec and
  plan before proceeding, per Constitution Principle III.
- The clarification workflow caught a critical issue in Scenario 3: the
  initial spec assumed canvas drawing was local-only (not synced to
  guessers), which would have made the game unplayable. The clarification
  question corrected this to polling-based canvas sync.
- The analysis workflow caught entity model inconsistencies (e.g., spec
  defining a "Round" entity that the plan didn't use, spec implying
  per-participant role storage when roles are derived from drawerId).
  These were fixed before implementation.
- Build validation (`npm run build`) was run after every implementation
  phase to catch type errors early.

## What I would do differently

- **Commit more granularly**: The implementation was done in large batches
  per scenario. More granular commits per task or per user story would
  improve traceability and make the PR diff easier to review.
- **Automated tests**: The lab relies on manual two-tab validation. Even
  a few unit tests for the backend scoring logic and word visibility
  filtering would add confidence.
- **Canvas rendering on result screen**: The result screen currently shows
  guess history and scores but not the final canvas drawing. Showing the
  canvas as a static image on the result screen would be a nice touch.
