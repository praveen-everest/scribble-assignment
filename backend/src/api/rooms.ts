import { Router } from "express";
import {
  clearCanvasSchema,
  createRoomSchema,
  drawSchema,
  endRoundSchema,
  guessSchema,
  HttpError,
  joinRoomSchema,
  restartSchema,
  roomCodeParamsSchema,
  roomViewerQuerySchema,
  startGameSchema
} from "./schemas.js";
import {
  addStroke,
  clearCanvas,
  createRoom,
  endRound,
  getRoom,
  joinRoom,
  restart,
  startGame,
  submitGuess,
  toRoomSnapshot
} from "../services/roomStore.js";

export function createRoomsRouter() {
  const router = Router();

  router.post("/", (request, response, next) => {
    try {
      const { playerName } = createRoomSchema.parse(request.body);

      if (!playerName.trim()) {
        throw new HttpError(400, "Player name is required");
      }

      const result = createRoom(playerName);

      if (!result) {
        throw new HttpError(400, "Player name is required");
      }

      response.status(201).json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/join", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { playerName } = joinRoomSchema.parse(request.body);
      const upperCode = code.toUpperCase().trim();

      if (!upperCode) {
        throw new HttpError(400, "Room code is required");
      }

      if (!playerName.trim()) {
        throw new HttpError(400, "Player name is required");
      }

      const room = getRoom(upperCode);
      if (!room) {
        throw new HttpError(404, "Room not found");
      }

      if (room.status !== "lobby") {
        throw new HttpError(403, "Game already in progress");
      }

      const result = joinRoom(upperCode, playerName);

      if (!result) {
        throw new HttpError(400, "Player name is required");
      }

      response.json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:code", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = roomViewerQuerySchema.parse(request.query);
      const room = getRoom(code.toUpperCase());

      if (!room) {
        throw new HttpError(404, "Room not found");
      }

      response.json({
        room: toRoomSnapshot(room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/start", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = startGameSchema.parse(request.body);

      const result = startGame(code.toUpperCase(), participantId);

      if ("error" in result) {
        throw new HttpError(result.status, result.error);
      }

      const { room } = result;
      response.json({
        room: toRoomSnapshot(room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/draw", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId, stroke } = drawSchema.parse(request.body);

      const result = addStroke(code.toUpperCase(), participantId, stroke);

      if ("error" in result) {
        throw new HttpError(result.status, result.error);
      }

      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/clear", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = clearCanvasSchema.parse(request.body);

      const result = clearCanvas(code.toUpperCase(), participantId);

      if ("error" in result) {
        throw new HttpError(result.status, result.error);
      }

      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/guess", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId, text } = guessSchema.parse(request.body);

      const result = submitGuess(code.toUpperCase(), participantId, text);

      if ("error" in result) {
        throw new HttpError(result.status, result.error);
      }

      response.json({ guess: result.guess });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/end-round", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = endRoundSchema.parse(request.body);

      const result = endRound(code.toUpperCase(), participantId);

      if ("error" in result) {
        throw new HttpError(result.status, result.error);
      }

      const { room } = result;
      response.json({
        room: toRoomSnapshot(room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/restart", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = restartSchema.parse(request.body);

      const result = restart(code.toUpperCase(), participantId);

      if ("error" in result) {
        throw new HttpError(result.status, result.error);
      }

      const { room } = result;
      response.json({
        room: toRoomSnapshot(room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
