import { z } from "zod";

export const createRoomSchema = z.object({
  playerName: z.string()
});

export const joinRoomSchema = z.object({
  playerName: z.string()
});

export const roomCodeParamsSchema = z.object({
  code: z.string()
});

export const roomViewerQuerySchema = z.object({
  participantId: z.string().optional()
});

export const startGameSchema = z.object({
  participantId: z.string()
});

export const drawSchema = z.object({
  participantId: z.string(),
  stroke: z.array(z.object({
    x: z.number(),
    y: z.number()
  }))
});

export const clearCanvasSchema = z.object({
  participantId: z.string()
});

export const guessSchema = z.object({
  participantId: z.string(),
  text: z.string()
});

export const endRoundSchema = z.object({
  participantId: z.string()
});

export const restartSchema = z.object({
  participantId: z.string()
});

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
