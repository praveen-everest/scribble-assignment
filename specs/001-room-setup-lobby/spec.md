# Feature Specification: Room Setup & Lobby

**Feature Branch**: `001-room-setup-lobby`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "Given a player wants to host or join a drawing game, When they create or join a room via a unique code, Then the creator is automatically the host; invalid/empty codes are rejected with clear feedback; rooms are fully isolated; the lobby refreshes via polling (~2s); and only the host can start the game once at least 2 players are present"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Room as Host (Priority: P1)

A player opens the app and creates a new room by entering their
name. The system generates a unique room code and places the
player into the lobby as the host. The player sees their room
code so they can share it with others.

**Why this priority**: Room creation is the entry point for all
gameplay. Without a room with a designated host, no other
feature can function.

**Independent Test**: Open a browser, enter a player name, click
Create Room. Verify the lobby loads, the room code is visible,
and the player is listed as the host.

**Acceptance Scenarios**:

1. **Given** a player is on the start screen, **When** they enter
   a name and create a room, **Then** the system generates a
   unique 4-character room code, places the player in the lobby,
   and marks them as the host.
2. **Given** a player is on the start screen, **When** they enter
   an empty or whitespace-only name and attempt to create a room,
   **Then** the system displays a clear error message and does not
   create the room.
3. **Given** two players each create separate rooms, **Then** each
   room has a distinct code, distinct participant lists, and
   neither room's state affects the other.

---

### User Story 2 - Join Room by Code (Priority: P1)

A player enters a room code and their name to join an existing
room. They land in the lobby and see the current participant
list. The host and other participants see the new player appear
after the next poll cycle.

**Why this priority**: Joining is the complement to creation —
a room with only a host cannot start a game.

**Independent Test**: Create a room in one tab, then open a
second tab and join using the room code. Verify the joiner
lands in the lobby and appears in the participant list.

**Acceptance Scenarios**:

1. **Given** a room exists with code "ABCD", **When** a player
   enters "ABCD" and a valid name, **Then** they join the room
   and see the lobby with all current participants.
2. **Given** no room exists with code "ZZZZ", **When** a player
   attempts to join with code "ZZZZ", **Then** the system
   displays a clear error message indicating the room was not
   found.
3. **Given** a player is on the join screen, **When** they submit
   an empty room code, **Then** the system displays a clear error
   message and does not attempt to join.
4. **Given** a player is on the join screen, **When** they enter
   a room code with lowercase letters, **Then** the system treats
   it as case-insensitive and joins the correct room.

---

### User Story 3 - Lobby Polling (Priority: P2)

Once in the lobby, the participant list refreshes automatically
at approximately 2-second intervals. Players see new joiners
appear without manually refreshing the page. The room code
remains visible so the host can share it.

**Why this priority**: Automatic polling replaces the manual
refresh button and is essential for a smooth multiplayer
experience, but it builds on top of working room creation and
joining.

**Independent Test**: Open two browser tabs in the same room.
Join a third player from a new tab. Verify the other two tabs
show the new player within approximately 2 seconds without any
manual action.

**Acceptance Scenarios**:

1. **Given** a player is in the lobby, **When** another player
   joins the same room, **Then** the first player's participant
   list updates automatically within approximately 2 seconds.
2. **Given** a player is in the lobby, **When** no new players
   join, **Then** the lobby continues to poll without errors and
   the displayed state remains stable.
3. **Given** a player navigates away from the lobby, **When** they
   leave the page, **Then** polling stops and no further requests
   are made.
4. **Given** a player is in the lobby and polling is active,
   **When** a poll request fails (network error or server
   unavailable), **Then** polling stops and the system displays a
   "Reconnect" button so the player can manually resume.

---

### User Story 4 - Host Starts Game (Priority: P2)

Only the host sees an enabled "Start Game" control. The control
is disabled (or hidden with a message) until at least 2 players
are in the room. Non-host players see a waiting message instead
of a start control.

**Why this priority**: The start-game gate is the exit condition
for the lobby and the entry point for gameplay. It depends on
host tracking and participant count, so it builds on stories 1-3.

**Independent Test**: Create a room (host) and join from a
second tab (joiner). Verify only the host tab shows the start
button. Verify the button is disabled when only the host is
present. Verify it becomes enabled once the second player joins.

**Acceptance Scenarios**:

1. **Given** a host is alone in the lobby, **When** they view
   the lobby, **Then** the start control is visible but disabled,
   with a message indicating more players are needed.
2. **Given** a host is in the lobby with at least 2 total
   participants, **When** they click "Start Game", **Then** the
   room transitions to the game state and all players are
   directed to the game screen.
3. **Given** a non-host player is in the lobby with 2 or more
   participants, **When** they view the lobby, **Then** they see
   a waiting message (e.g., "Waiting for host to start") and no
   start control.

---

### Edge Cases

- What happens when a player tries to join a room that has
  already transitioned to the game state? The system MUST reject
  the join with a clear message (e.g., "Game already in
  progress").
- What happens when the host leaves or closes their browser
  during the lobby phase? Host status is not transferred; the
  room remains without a host and no one can start the game.
  Players see the waiting message indefinitely.
- What happens when two players submit the same name in the same
  room? The system allows it — players are distinguished by their
  unique participant ID, not by name.
- What happens when a player submits a room code with leading or
  trailing whitespace? The system trims the input before lookup.
- What happens when a player (including the host) refreshes their
  browser? Their participant ID is lost. They must rejoin the room
  as a new participant. If the host refreshes, they lose host
  status and the room becomes unstartable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST assign host status to the player who
  creates the room. Host status is stored as part of the room
  state.
- **FR-002**: System MUST generate a unique 4-character
  alphanumeric room code on room creation, avoiding ambiguous
  characters (I, O, 1, L).
- **FR-003**: System MUST reject join attempts with an empty,
  whitespace-only, or non-existent room code and display a
  specific, user-readable error message for each case.
- **FR-004**: System MUST reject room creation or join attempts
  with an empty or whitespace-only player name and display a
  clear error message.
- **FR-005**: System MUST treat room codes as case-insensitive
  during join (e.g., "abcd" matches room "ABCD").
- **FR-006**: System MUST keep rooms fully isolated — actions in
  one room MUST NOT affect any other room's state.
- **FR-007**: The lobby MUST automatically poll for updated room
  state at approximately 2-second intervals without requiring
  manual user action.
- **FR-008**: Polling MUST stop when the player navigates away
  from the lobby screen.
- **FR-009**: Only the host MUST be able to trigger the "Start
  Game" action. Non-host players MUST NOT see a start control.
- **FR-010**: The "Start Game" action MUST be disabled until at
  least 2 participants are present in the room.
- **FR-011**: When the host starts the game, the room status MUST
  transition from "lobby" to the game state, and all participants
  MUST be directed to the game screen on their next poll cycle.
- **FR-012**: System MUST reject join attempts to rooms that have
  already transitioned out of the lobby state.
- **FR-013**: The lobby participant list MUST display a "(Host)"
  label next to the host's name so all players can identify who
  controls the game.
- **FR-014**: If a poll request fails, polling MUST stop
  immediately and the lobby MUST display a "Reconnect" button
  that allows the player to manually resume polling.

### Key Entities

- **Room**: Represents a game session. Key attributes: unique
  code, current status (lobby or game), list of participants,
  reference to the host participant, creation timestamp.
- **Participant**: A player within a room. Key attributes: unique
  identifier, display name, join timestamp, host flag (boolean).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can create a room and land in the lobby in
  under 3 seconds from clicking "Create Room".
- **SC-002**: A player can join an existing room by code and see
  the participant list in under 3 seconds from clicking "Join".
- **SC-003**: New participants appear in all lobby views within
  approximately 2 seconds of joining, without manual refresh.
- **SC-004**: 100% of invalid inputs (empty name, empty code,
  non-existent code) produce a visible, descriptive error message
  rather than a silent failure or generic error.
- **SC-005**: Two rooms created simultaneously operate with
  complete isolation — no cross-room state leakage.
- **SC-006**: The host can start the game only when 2 or more
  players are present; the start control is inaccessible to
  non-host players.

## Clarifications

### Session 2026-06-02

- Q: Does the participant ID persist across page refresh? → A: No. Participant ID is held in memory only and lost on any page refresh. The player must rejoin as a new participant.
- Q: How is the host visually identified to other players? → A: A "(Host)" label is displayed next to the host's name in the participant list.
- Q: What happens when a lobby poll request fails? → A: Polling stops on first failure and the system displays a "Reconnect" button for the player to manually resume.
- Q: Is there a maximum number of players per room? → A: No cap. Any number of players may join a room.

## Assumptions

- Players have a stable network connection and use a modern
  desktop browser. Mobile-specific responsive layout is not
  required.
- All room and participant data is stored in memory only.
  Restarting the server clears all rooms — this is by design.
- There is no authentication system. Players are identified solely
  by a generated participant ID held in application memory.
  Refreshing the page loses the ID; the player must rejoin as a
  new participant.
- Duplicate player names within a room are permitted; uniqueness
  is enforced by participant ID, not by name.
- Host status does not transfer if the host disconnects. The room
  becomes unstartable. This is acceptable for the lab scope.
- The room code format (4 alphanumeric characters, excluding
  ambiguous characters) is inherited from the existing starter
  and is not changed by this feature.
- There is no maximum player limit per room. Any number of players
  may join.
