import { randomUUID } from "node:crypto";
import type { Guess, Participant, Point, Room, RoomSnapshot } from "../models/game.js";
import { STARTER_ROLES, STARTER_WORDS } from "../seed/starterData.js";

const rooms = new Map<string, Room>();

function now() {
  return new Date().toISOString();
}

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 4; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function generateUniqueCode() {
  let code = generateCode();

  while (rooms.has(code)) {
    code = generateCode();
  }

  return code;
}

function createParticipant(name: string): Participant {
  return {
    id: randomUUID(),
    name: name.trim(),
    joinedAt: now()
  };
}

function cloneRoom(room: Room) {
  return structuredClone(room);
}

export function listWords() {
  return [...STARTER_WORDS];
}

export function createRoom(playerName: string) {
  const trimmed = playerName.trim();
  if (!trimmed) {
    return null;
  }

  const participant = createParticipant(trimmed);
  const room: Room = {
    code: generateUniqueCode(),
    status: "lobby",
    hostId: participant.id,
    drawerId: null,
    secretWord: null,
    strokes: [],
    guesses: [],
    scores: {},
    participants: [participant],
    createdAt: now(),
    updatedAt: now()
  };

  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function joinRoom(code: string, playerName: string) {
  const trimmed = playerName.trim();
  if (!trimmed) {
    return null;
  }

  const room = rooms.get(code);

  if (!room) {
    return null;
  }

  const participant = createParticipant(trimmed);
  room.participants.push(participant);
  room.updatedAt = now();
  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function getRoom(code: string) {
  const room = rooms.get(code);
  return room ? cloneRoom(room) : null;
}

export function startGame(code: string, participantId: string): { error: string; status: number } | { room: Room } {
  const room = rooms.get(code);

  if (!room) {
    return { error: "Room not found", status: 404 };
  }

  if (room.status !== "lobby") {
    return { error: "Game has already started", status: 400 };
  }

  if (room.hostId !== participantId) {
    return { error: "Only the host can start the game", status: 403 };
  }

  if (room.participants.length < 2) {
    return { error: "At least 2 players are required to start", status: 400 };
  }

  room.status = "playing";
  room.drawerId = room.hostId;
  room.secretWord = STARTER_WORDS[0];
  room.strokes = [];
  room.guesses = [];
  room.scores = {};
  for (const p of room.participants) {
    room.scores[p.id] = 0;
  }
  room.updatedAt = now();
  rooms.set(room.code, room);

  return { room: cloneRoom(room) };
}

export function addStroke(code: string, participantId: string, stroke: Point[]): { error: string; status: number } | { ok: true } {
  const room = rooms.get(code);

  if (!room) {
    return { error: "Room not found", status: 404 };
  }

  if (room.status !== "playing") {
    return { error: "Game is not active", status: 400 };
  }

  if (room.drawerId !== participantId) {
    return { error: "Only the drawer can draw", status: 403 };
  }

  room.strokes.push(stroke);
  room.updatedAt = now();
  rooms.set(room.code, room);

  return { ok: true };
}

export function clearCanvas(code: string, participantId: string): { error: string; status: number } | { ok: true } {
  const room = rooms.get(code);

  if (!room) {
    return { error: "Room not found", status: 404 };
  }

  if (room.status !== "playing") {
    return { error: "Game is not active", status: 400 };
  }

  if (room.drawerId !== participantId) {
    return { error: "Only the drawer can clear the canvas", status: 403 };
  }

  room.strokes = [];
  room.updatedAt = now();
  rooms.set(room.code, room);

  return { ok: true };
}

export function submitGuess(code: string, participantId: string, text: string): { error: string; status: number } | { guess: Guess } {
  const room = rooms.get(code);

  if (!room) {
    return { error: "Room not found", status: 404 };
  }

  if (room.status !== "playing") {
    return { error: "Game is not active", status: 400 };
  }

  if (room.drawerId === participantId) {
    return { error: "The drawer cannot submit guesses", status: 403 };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { error: "Guess cannot be empty", status: 400 };
  }

  const participant = room.participants.find((p) => p.id === participantId);
  if (!participant) {
    return { error: "Participant not found", status: 404 };
  }

  const correct = trimmed.toLowerCase() === (room.secretWord ?? "").toLowerCase();

  const guess: Guess = {
    participantId,
    playerName: participant.name,
    text: trimmed,
    correct,
    timestamp: now()
  };

  room.guesses.push(guess);

  if (correct) {
    room.scores[participantId] = (room.scores[participantId] ?? 0) + 100;
  }

  room.updatedAt = now();
  rooms.set(room.code, room);

  return { guess };
}

export function saveRoom(room: Room) {
  room.updatedAt = now();
  rooms.set(room.code, cloneRoom(room));
  return getRoom(room.code);
}

export function toRoomSnapshot(room: Room, viewerParticipantId?: string): RoomSnapshot {
  const isDrawer = viewerParticipantId != null && viewerParticipantId === room.drawerId;

  return {
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    drawerId: room.drawerId,
    secretWord: isDrawer ? room.secretWord : null,
    strokes: room.strokes.map((stroke) => stroke.map((p) => ({ ...p }))),
    guesses: room.guesses.map((g) => ({ ...g })),
    scores: { ...room.scores },
    participants: room.participants.map((participant) => ({ ...participant })),
    availableWords: listWords(),
    roles: [...STARTER_ROLES]
  };
}
