import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { useRoomState, useRoomStore } from "../state/roomStore";

const POLL_INTERVAL_MS = 2000;

export function LobbyPage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, participantId, error, isLoading } = useRoomState();
  const [pollError, setPollError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isHost = room?.hostId === participantId;
  const canStart = isHost && (room?.participants.length ?? 0) >= 2;

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    setPollError(null);

    intervalRef.current = setInterval(async () => {
      try {
        await roomStore.fetchRoom();
      } catch {
        stopPolling();
        setPollError("Connection lost. Click Reconnect to resume.");
      }
    }, POLL_INTERVAL_MS);
  }, [roomStore, stopPolling]);

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
      return;
    }

    startPolling();
    return stopPolling;
  }, [navigate, room?.code, startPolling, stopPolling]);

  useEffect(() => {
    if (room && room.status === "playing") {
      stopPolling();
      navigate("/game");
    }
  }, [room, navigate, stopPolling]);

  async function handleStartGame() {
    try {
      setStartError(null);
      await roomStore.startGame();
      navigate("/game");
    } catch (caughtError) {
      setStartError(
        caughtError instanceof Error ? caughtError.message : "Unable to start game"
      );
    }
  }

  if (!room) {
    return null;
  }

  return (
    <section className="panel placeholder-page">
      <div className="lobby-header">
        <PageHeader
          kicker="Waiting for players"
          title="Lobby"
          description="Share the room code with friends so they can join your game."
        />
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="summary-grid">
        <Card title="Participants">
          {room.participants.length === 0 ? (
            <p>No participants are connected to this room yet.</p>
          ) : (
            <ul className="player-list">
              {room.participants.map((participant) => (
                <li key={participant.id}>
                  <span>
                    {participant.name}
                    {participant.id === room.hostId ? " (Host)" : ""}
                  </span>
                  <span className="player-list__meta">joined</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Status">
          {pollError ? (
            <>
              <p className="status-line" style={{ backgroundColor: "#fef2f2", color: "#b91c1c" }}>
                {pollError}
              </p>
              <button
                className="button button--secondary"
                style={{ marginTop: "8px" }}
                onClick={startPolling}
              >
                Reconnect
              </button>
            </>
          ) : (
            <>
              <p
                className="status-line"
                style={{
                  backgroundColor: isLoading ? "#fef3c7" : "#e0e7ff",
                  color: isLoading ? "#b45309" : "#3730a3"
                }}
              >
                {isLoading ? "Refreshing players..." : "Ready to play"}
              </p>
              <p style={{ marginTop: "8px" }}>
                {error ?? startError ?? (isHost
                  ? canStart
                    ? "You can start the game now."
                    : "Waiting for more players to join..."
                  : "Waiting for host to start the game.")}
              </p>
            </>
          )}
        </Card>
      </div>

      <div className="button-row button-row--spread">
        <button className="button button--secondary" onClick={() => navigate("/")}>
          Leave Lobby
        </button>
        {isHost ? (
          <button
            className="button button--primary"
            disabled={!canStart || isLoading}
            onClick={handleStartGame}
          >
            Start Game
          </button>
        ) : (
          <span className="status-line" style={{ padding: "8px 16px", backgroundColor: "#e0e7ff", color: "#3730a3" }}>
            Waiting for host to start
          </span>
        )}
      </div>
    </section>
  );
}
