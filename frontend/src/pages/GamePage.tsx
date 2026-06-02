import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { GuessForm } from "../components/GuessForm";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Scoreboard } from "../components/Scoreboard";
import { useRoomState, useRoomStore } from "../state/roomStore";

const POLL_INTERVAL_MS = 2000;

export function GamePage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, participantId } = useRoomState();
  const [pollError, setPollError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Array<{ x: number; y: number }>>([]);

  const isHost = room?.hostId === participantId;
  const isDrawer = room?.drawerId != null && room.drawerId === participantId;
  const isResult = room?.status === "result";
  const isPlaying = room?.status === "playing";
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

  // Navigate to lobby when status changes to "lobby" (after restart)
  useEffect(() => {
    if (room && room.status === "lobby") {
      stopPolling();
      navigate("/lobby");
    }
  }, [room?.status, navigate, stopPolling]);

  // Render strokes from room state onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !room) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const stroke of room.strokes ?? []) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x * w, stroke[0].y * h);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x * w, stroke[i].y * h);
      }
      ctx.stroke();
    }

    if (isDrawer && isPlaying && currentStrokeRef.current.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(currentStrokeRef.current[0].x * w, currentStrokeRef.current[0].y * h);
      for (let i = 1; i < currentStrokeRef.current.length; i++) {
        ctx.lineTo(currentStrokeRef.current[i].x * w, currentStrokeRef.current[i].y * h);
      }
      ctx.stroke();
    }
  }, [room?.strokes, isDrawer, isPlaying]);

  function getCanvasPoint(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height
    };
  }

  function handleMouseDown(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawer || !isPlaying) return;
    isDrawingRef.current = true;
    const point = getCanvasPoint(event);
    if (point) {
      currentStrokeRef.current = [point];
    }
  }

  function handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawer || !isPlaying || !isDrawingRef.current) return;
    const point = getCanvasPoint(event);
    if (!point) return;

    currentStrokeRef.current.push(point);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = currentStrokeRef.current;
    if (points.length < 2) return;

    const prev = points[points.length - 2];
    const curr = points[points.length - 1];

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(prev.x * canvas.width, prev.y * canvas.height);
    ctx.lineTo(curr.x * canvas.width, curr.y * canvas.height);
    ctx.stroke();
  }

  function handleMouseUp() {
    if (!isDrawer || !isPlaying || !isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (currentStrokeRef.current.length >= 2) {
      roomStore.addStroke([...currentStrokeRef.current]);
    }
    currentStrokeRef.current = [];
  }

  async function handleClearCanvas() {
    try {
      await roomStore.clearCanvas();
    } catch {
      // Ignore
    }
  }

  async function handleEndRound() {
    try {
      await roomStore.endRound();
    } catch {
      // Ignore
    }
  }

  async function handleRestart() {
    try {
      await roomStore.restart();
      navigate("/lobby");
    } catch {
      // Ignore
    }
  }

  if (!room) {
    return null;
  }

  // Result screen
  if (isResult) {
    return (
      <section className="panel game-page">
        <div className="game-page__header">
          <div className="game-page__header-left">
            <span className="section-kicker">Round Over</span>
            <h1 className="game-page__title">
              The word was: {room.secretWord ?? "unknown"}
            </h1>
          </div>
          <RoomCodeBadge code={room.code} />
        </div>

        <div className="game-page__layout">
          <aside className="game-page__sidebar game-page__sidebar--left">
            <Scoreboard room={room} />
          </aside>

          <div className="game-page__main">
            <Card title="Guess History">
              {(room.guesses ?? []).length === 0 ? (
                <p style={{ color: "#9ca3af" }}>No guesses were submitted.</p>
              ) : (
                <ul className="player-list">
                  {(room.guesses ?? []).map((guess, idx) => (
                    <li key={idx}>
                      <span>
                        <strong>{guess.playerName}</strong>: {guess.text}
                      </span>
                      <span
                        className="player-list__meta"
                        style={{ color: guess.correct ? "#16a34a" : "#9ca3af" }}
                      >
                        {guess.correct ? "correct" : "wrong"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <aside className="game-page__sidebar game-page__sidebar--right">
            <Card title="Player Info">
              <dl className="detail-list">
                <div>
                  <dt>Name</dt>
                  <dd>{room.participants.find((p) => p.id === participantId)?.name ?? "Unknown"}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{isDrawer ? "Drawer" : "Guesser"}</dd>
                </div>
              </dl>
            </Card>

            {pollError && (
              <Card title="Status">
                <p style={{ color: "#b91c1c" }}>{pollError}</p>
                <button className="button button--secondary" style={{ marginTop: "8px" }} onClick={startPolling}>
                  Reconnect
                </button>
              </Card>
            )}
          </aside>
        </div>

        <div className="button-row button-row--spread">
          <button className="button button--secondary" onClick={() => navigate("/")}>
            Leave
          </button>
          {isHost ? (
            <button className="button button--primary" onClick={handleRestart}>
              Play Again
            </button>
          ) : (
            <span className="status-line" style={{ padding: "8px 16px", backgroundColor: "#e0e7ff", color: "#3730a3" }}>
              Waiting for host to restart
            </span>
          )}
        </div>
      </section>
    );
  }

  // Playing screen
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
          <Scoreboard room={room} />
          <Card title="Guess History">
            {(room.guesses ?? []).length === 0 ? (
              <p style={{ color: "#9ca3af" }}>No guesses yet.</p>
            ) : (
              <ul className="player-list">
                {(room.guesses ?? []).map((guess, idx) => (
                  <li key={idx}>
                    <span>
                      <strong>{guess.playerName}</strong>: {guess.text}
                    </span>
                    <span
                      className="player-list__meta"
                      style={{ color: guess.correct ? "#16a34a" : "#9ca3af" }}
                    >
                      {guess.correct ? "correct" : "wrong"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>

        <div className="game-page__main">
          <Card title="Canvas">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              style={{
                width: "100%",
                height: "500px",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                cursor: isDrawer ? "crosshair" : "default",
                display: "block"
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            {isDrawer && (
              <div className="button-row button-row--compact" style={{ marginTop: "8px" }}>
                <button className="button button--secondary" onClick={handleClearCanvas}>
                  Clear Canvas
                </button>
              </div>
            )}
          </Card>
        </div>

        <aside className="game-page__sidebar game-page__sidebar--right">
          <Card title="Player Info">
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{room.participants.find((p) => p.id === participantId)?.name ?? "Unknown player"}</dd>
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
              <button className="button button--secondary" style={{ marginTop: "8px" }} onClick={startPolling}>
                Reconnect
              </button>
            </Card>
          ) : isDrawer ? (
            <Card title="Game Controls">
              <p style={{ color: "#6b7280", marginBottom: "8px" }}>You are drawing!</p>
            </Card>
          ) : (
            <Card title="Your Guess">
              <GuessForm />
            </Card>
          )}
        </aside>
      </div>

      <div className="button-row button-row--spread">
        <button className="button button--secondary" onClick={() => navigate("/lobby")}>
          Exit Game
        </button>
        {isHost && (
          <button className="button button--secondary" onClick={handleEndRound}>
            End Round
          </button>
        )}
      </div>
    </section>
  );
}
