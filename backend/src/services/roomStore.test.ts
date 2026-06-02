import { describe, expect, it } from "vitest";
import { createRoom, joinRoom } from "./roomStore.js";

describe("roomStore", () => {
  it("createRoom returns a room with a 4-character uppercase code", () => {
    const result = createRoom("Alice");

    expect(result).not.toBeNull();
    expect(result!.room.code).toMatch(/^[A-Z0-9]{4}$/);
    expect(result!.room.participants).toHaveLength(1);
    expect(result!.room.participants[0].name).toBe("Alice");
    expect(result!.participantId).toBeDefined();
  });

  it("joinRoom returns null for an unknown room code", () => {
    const result = joinRoom("ZZZZ", "Bob");

    expect(result).toBeNull();
  });
});
