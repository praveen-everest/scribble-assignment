import { Card } from "./Card";
import type { RoomSnapshot } from "../services/api";

interface ScoreboardProps {
  room: RoomSnapshot;
}

export function Scoreboard({ room }: ScoreboardProps) {
  return (
    <Card title="Scoreboard">
      <div style={{ backgroundColor: "#f9fafb", borderRadius: "6px", padding: "8px" }}>
        {room.participants.map((participant) => {
          const role = participant.id === room.drawerId ? "Drawer" : "Guesser";
          const score = room.scores?.[participant.id] ?? 0;
          return (
            <div
              key={participant.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "4px 8px"
              }}
            >
              <span>
                {participant.name} <span style={{ color: "#6b7280", fontSize: "0.85em" }}>({role})</span>
              </span>
              <strong>{score}</strong>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
