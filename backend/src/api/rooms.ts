import { Router } from "express";
import {
  createRoomSchema,
  HttpError,
  joinRoomSchema,
  roomCodeParamsSchema,
  roomViewerQuerySchema,
  startGameSchema
} from "./schemas.js";
import { createRoom, getRoom, joinRoom, startGame, toRoomSnapshot } from "../services/roomStore.js";

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

  return router;
}
