import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { GuessForm } from "../components/GuessForm";
import { ResultPanel } from "../components/ResultPanel";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Scoreboard } from "../components/Scoreboard";
import { useRoomState, useRoomStore } from "../state/roomStore";

const POLL_INTERVAL_MS = 2000;

export function GamePage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, participantId, isLoading } = useRoomState();
  const [pollError, setPollError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isDrawer = room?.drawerId != null && room.drawerId === participantId;
  const drawerName = room?.participants.find((p) => p.id === room.drawerId)?.name ?? "Unknown";

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

    roomStore.fetchRoom().catch(() => {});
    startPolling();
    return stopPolling;
  }, [navigate, room?.code, startPolling, stopPolling]);

  if (!room) {
    return null;
  }

  const viewer = room.participants.find((p) => p.id === participantId) ?? null;

  return (
    <section className="panel game-page">
      <div className="game-page__header">
        <div className="game-page__header-left">
          <span className="section-kicker">Round 1</span>
          <h1 className="game-page__title">
            {isDrawer && room.secretWord
              ? `Your word: ${room.secretWord}`
              : "Guess the word!"}
          </h1>
          <p style={{ marginTop: "4px", color: "#6b7280" }}>
            Drawing: {drawerName}
          </p>
        </div>
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="game-page__layout">
        <aside className="game-page__sidebar game-page__sidebar--left">
          <Card title="Players">
            <ul className="player-list">
              {room.participants.map((participant) => {
                const role = participant.id === room.drawerId ? "Drawer" : "Guesser";
                return (
                  <li key={participant.id}>
                    <span>
                      {participant.name} ({role})
                    </span>
                    {participant.id === participantId && (
                      <span className="player-list__meta">you</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
          <ResultPanel />
        </aside>

        <div className="game-page__main">
          <Card title="Canvas">
            <div
              className="canvas-placeholder"
              style={{
                minHeight: "500px",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb"
              }}
            >
              {isDrawer ? "You are the drawer!" : `Waiting for ${drawerName} to draw...`}
            </div>
          </Card>
        </div>

        <aside className="game-page__sidebar game-page__sidebar--right">
          <Card title="Player Info">
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{viewer?.name ?? "Unknown player"}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{isDrawer ? "Drawer" : "Guesser"}</dd>
              </div>
            </dl>
          </Card>

          {pollError ? (
            <Card title="Status">
              <p style={{ color: "#b91c1c" }}>{pollError}</p>
              <button
                className="button button--secondary"
                style={{ marginTop: "8px" }}
                onClick={startPolling}
              >
                Reconnect
              </button>
            </Card>
          ) : (
            <Card title="Your Guess">
              <GuessForm />
            </Card>
          )}
        </aside>
      </div>

      <div className="button-row">
        <button className="button button--secondary" onClick={() => navigate("/lobby")}>
          Exit Game
        </button>
      </div>
    </section>
  );
}
